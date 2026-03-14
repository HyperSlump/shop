import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { printfulService } from '@/lib/services/printfulService'
import { getProductFile } from '@/lib/products'
import { buildDownloadEmail } from '@/lib/email/downloadEmail'
import Stripe from 'stripe'

function resolveEmailUiMode(modeLike?: string): 'dark' | 'light' {
    const mode = String(modeLike || '').trim().toLowerCase()
    if (mode === 'light' || mode === 'stripe' || mode === 'day') return 'light'
    return 'dark'
}

export async function POST(req: Request) {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get('Stripe-Signature') as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    try {
        if (!sig || !webhookSecret) return new NextResponse('Missing signature or secret', { status: 400 })
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const object = event.data.object as any // eslint-disable-line @typescript-eslint/no-explicit-any
        const isSession = event.type === 'checkout.session.completed'

        const customerEmail = isSession
            ? object.customer_details?.email
            : (object.receipt_email || object.metadata?.email)
        const metadata = object.metadata || {}
        const uiMode = resolveEmailUiMode(metadata.ui_mode || metadata.theme)

        // Parse item details from metadata (chunked if over Stripe's 500 char limit)
        let itemsJson: string | null = ''
        if (metadata.item_details) {
            itemsJson = metadata.item_details
        } else {
            let i = 0
            while (metadata[`item_details_${i}`]) {
                itemsJson += metadata[`item_details_${i}`]
                i++
            }
        }
        itemsJson = itemsJson || null

        let items: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
        if (itemsJson) {
            try { items = JSON.parse(itemsJson) } catch { console.error('Failed to parse items JSON') }
        }

        // 1. Digital Fulfillment — Supabase record + branded Resend email
        const digitalItems = items.filter((item: any) => item.type === 'DIGITAL') // eslint-disable-line @typescript-eslint/no-explicit-any
        if (digitalItems.length > 0 && customerEmail) {
            try {
                // Save purchase records to Supabase
                const purchases = digitalItems.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                    customer_email: customerEmail,
                    stripe_session_id: object.id,
                    price_id: item.id || '',
                    is_verified: true,
                }))
                await supabaseAdmin.from('purchases').insert(purchases)

                // Resolve direct download URLs per item from the product file map
                const downloadItems = digitalItems.map((item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    const fileInfo = getProductFile(item.id)
                    return {
                        name: item.name,
                        label: fileInfo.label,
                        downloadUrl: fileInfo.url,
                    }
                })

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hyperslump.xyz'

                const html = buildDownloadEmail({
                    customerEmail,
                    items: downloadItems,
                    sessionId: object.id,
                    appUrl,
                    uiMode,
                })

                await resend.emails.send({
                    from: 'hyper$lump <onboarding@resend.dev>',
                    to: customerEmail,
                    subject: 'Your download is ready — hyper$lump',
                    html,
                })

                console.log(`>>> [WEBHOOK] Download email sent to ${customerEmail} for ${downloadItems.length} item(s)`)
            } catch (err) {
                console.error('Digital fulfillment error:', err)
            }
        }

        // 2. Physical Fulfillment — Printful draft order
        const physicalItems = items.filter((item: any) => item.type === 'PHYSICAL') // eslint-disable-line @typescript-eslint/no-explicit-any
        const shippingDetails = isSession ? object.shipping_details : object.shipping
        const fallbackAddress = object.customer_details?.address
        const shippingAddress = shippingDetails?.address || fallbackAddress
        const shippingName = shippingDetails?.name || object.customer_details?.name || object.shipping?.name
        const hasShippingAddress = Boolean(
            shippingAddress?.line1 &&
            shippingAddress?.city &&
            shippingAddress?.country &&
            shippingAddress?.postal_code
        )

        if (physicalItems.length > 0 && !hasShippingAddress) {
            console.error('>>> [WEBHOOK] Missing shipping payload for physical order:', {
                id: object.id,
                type: event.type,
            })
        }

        if (physicalItems.length > 0 && hasShippingAddress) {
            try {
                const printfulItems = physicalItems.map((item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    const rawVariantId = item.v_id ?? item.variant_id
                    const parsedVariantId = Number.parseInt(String(rawVariantId), 10)
                    if (!Number.isFinite(parsedVariantId)) {
                        throw new Error(`Invalid Printful sync_variant_id for item ${item.id || item.name || 'unknown'}`)
                    }

                    const rawQuantity = item.qty ?? item.quantity ?? 1
                    const parsedQuantity = Number.parseInt(String(rawQuantity), 10)
                    const quantity = Number.isFinite(parsedQuantity)
                        ? Math.max(1, Math.min(10, parsedQuantity))
                        : 1

                    return {
                        sync_variant_id: parsedVariantId,
                        quantity,
                    }
                })

                const orderData = {
                    shipping: metadata.shipping_id || 'STANDARD',
                    recipient: {
                        name: shippingName,
                        address1: shippingAddress.line1,
                        city: shippingAddress.city,
                        state_code: shippingAddress.state,
                        country_code: shippingAddress.country,
                        zip: shippingAddress.postal_code,
                        email: customerEmail,
                    },
                    items: printfulItems,
                    external_id: object.id,
                }

                // Auto-fulfill in Printful (creates order as pending)
                const createdOrder = await printfulService.createOrder(orderData, 'pending')
                console.log('>>> [WEBHOOK] Printful Order Created (pending):', object.id, '->', createdOrder?.id)
            } catch (err) {
                console.error('Printful fulfillment error:', err)
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
