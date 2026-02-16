import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    try {
        const { amount, currency = 'usd', metadata } = await req.json()

        if (!amount) {
            return new NextResponse('Amount is required', { status: 400 })
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata,
        })

        return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        console.error('Error creating payment intent:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
