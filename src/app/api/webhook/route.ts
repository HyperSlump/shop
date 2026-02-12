import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
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
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const customerEmail = session.customer_details?.email

        // Fetch all line items for this session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

        if (customerEmail && lineItems.data.length > 0) {
            try {
                // 1. Record each item in Supabase
                const purchases = lineItems.data.map(item => ({
                    customer_email: customerEmail,
                    stripe_session_id: session.id,
                    price_id: item.price?.id || '',
                    is_verified: true,
                }))

                // We use upsert or insert. If user hasn't run migration to drop unique constraint, 
                // this might fail for multiple items.
                const { error: dbError } = await supabaseAdmin
                    .from('purchases')
                    .insert(purchases)

                if (dbError) {
                    console.error('Database Error:', dbError)
                }

                // 2. Send email with verification link
                await resend.emails.send({
                    from: 'Acme <onboarding@resend.dev>', // Update this with your verified domain
                    to: customerEmail,
                    subject: 'Your Digital Download is Here',
                    html: `
            <h1>Thank you for your purchase!</h1>
            <p>You bought ${lineItems.data.length} item(s).</p>
            <p>You can download your files here:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/success?session_id=${session.id}">Download Now</a>
          `,
                })

            } catch (err) {
                console.error('Error processing checkout:', err)
                return new NextResponse('Internal Error', { status: 500 })
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
