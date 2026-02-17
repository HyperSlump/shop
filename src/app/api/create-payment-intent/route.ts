import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    try {
        const { cart } = await req.json();

        if (!cart || cart.length === 0) {
            return new NextResponse('Cart is empty', { status: 400 });
        }

        // Always calculate total on the server to prevent price tampering
        const total = cart.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

        console.log('[API] Creating PaymentIntent for total:', total);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: cart.map((item: any) => item.name).join(', '),
                item_ids: cart.map((item: any) => item.id).join(','),
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error('[API] Payment Intent Creation Failed:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
