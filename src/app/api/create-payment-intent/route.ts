import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    console.log('>>> [STRIPE_API] POST RECEIVED');
    try {
        const body = await req.json();
        const { cart } = body;

        console.log('>>> [STRIPE_API] Payload received:', JSON.stringify(cart, null, 2));

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            console.error('>>> [STRIPE_API] Validation Failed: Empty or invalid cart');
            return new NextResponse('INVALID_CART_DATA', { status: 400 });
        }

        // Always calculate total on the server to prevent price tampering
        const total = cart.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        console.log('>>> [STRIPE_API] Calculated Total:', total);

        if (total <= 0) {
            console.error('>>> [STRIPE_API] Total is 0 or negative');
            return new NextResponse('INVALID_TOTAL', { status: 400 });
        }

        console.log('>>> [STRIPE_API] Requesting PaymentIntent from Stripe...');
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

        console.log('>>> [STRIPE_API] PaymentIntent Created Successfully:', paymentIntent.id);
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (error: any) {
        console.error('>>> [STRIPE_API] ERROR CAUGHT:', error);
        return new NextResponse(JSON.stringify({
            error: error.message,
            code: error.code,
            type: error.type
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
