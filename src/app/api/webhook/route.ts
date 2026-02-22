import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { printfulService } from '@/lib/services/printfulService'
import Stripe from 'stripe'

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
        const object = event.data.object as any;
        const isSession = event.type === 'checkout.session.completed';

        const customerEmail = isSession ? object.customer_details?.email : (object.receipt_email || object.metadata?.email);
        const metadata = object.metadata || {};
        const itemsJson = metadata.item_details;

        let items: any[] = [];
        if (itemsJson) {
            try { items = JSON.parse(itemsJson); } catch (e) { console.error('Failed to parse items JSON'); }
        }

        // 1. Digital Fulfillment (Supabase & Resend)
        const digitalItems = items.filter((item: any) => item.type === 'DIGITAL');
        if (digitalItems.length > 0 && customerEmail) {
            try {
                const purchases = digitalItems.map((item: any) => ({
                    customer_email: customerEmail,
                    stripe_session_id: object.id,
                    price_id: item.id || '',
                    is_verified: true,
                }));

                await supabaseAdmin.from('purchases').insert(purchases);

                await resend.emails.send({
                    from: 'hyper$lump <onboarding@resend.dev>',
                    to: customerEmail,
                    subject: 'DECRYPTED: Your Digital Assets',
                    html: `
                        <div style="font-family: monospace; background: #000; color: #fff; padding: 40px;">
                            <h1 style="color: #D83A3D;">ACCESS_GRANTED //</h1>
                            <p>Your payment has been verified. Secure link established.</p>
                            <p>Items: ${digitalItems.map((i: any) => i.name).join(', ')}</p>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/success?session_id=${object.id}" 
                               style="display: inline-block; background: #D83A3D; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                                DOWNLOAD_NOW
                            </a>
                        </div>
                    `,
                });
            } catch (err) {
                console.error('Digital fulfillment error:', err);
            }
        }

        // 2. Physical Fulfillment (Printful)
        const physicalItems = items.filter((item: any) => item.type === 'PHYSICAL');
        const shipping = object.shipping;

        if (physicalItems.length > 0 && shipping) {
            try {
                const orderData = {
                    recipient: {
                        name: shipping.name,
                        address1: shipping.address.line1,
                        city: shipping.address.city,
                        state_code: shipping.address.state,
                        country_code: shipping.address.country,
                        zip: shipping.address.postal_code,
                        email: customerEmail
                    },
                    items: physicalItems.map((item: any) => ({
                        sync_variant_id: parseInt(item.variant_id),
                        quantity: 1
                    })),
                    external_id: object.id
                };

                // Create as draft for safety
                await printfulService.createOrder(orderData, 'draft');
                console.log('>>> [WEBHOOK] Printful Draft Order Created:', object.id);
            } catch (err) {
                console.error('Printful fulfillment error:', err);
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
