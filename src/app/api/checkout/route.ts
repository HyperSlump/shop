import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { lineItems } = await req.json()
        const headersList = await headers()
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

        if (!lineItems || lineItems.length === 0) {
            return new NextResponse('Line items are required', { status: 400 })
        }

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems.map((item: { priceId: string }) => ({
                price: item.priceId,
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cancel`,
            metadata: {
                is_cart: 'true',
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
