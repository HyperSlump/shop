import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    console.log('>>> [STRIPE_API] POST RECEIVED');
    try {
        const body = await req.json();
        const { cart, shippingAmount, recipient } = body;

        console.log('>>> [STRIPE_API] Payload received:', JSON.stringify({ cart, shippingAmount, recipient }, null, 2));

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            console.error('>>> [STRIPE_API] Validation Failed: Empty or invalid cart');
            return new NextResponse('INVALID_CART_DATA', { status: 400 });
        }

        // Always calculate total on the server to prevent price tampering
        const productsTotal = cart.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        const total = productsTotal + (shippingAmount || 0);

        console.log('>>> [STRIPE_API] Calculated Total:', total, `(Products: ${productsTotal}, Shipping: ${shippingAmount || 0})`);

        if (total <= 0) {
            console.error('>>> [STRIPE_API] Total is 0 or negative');
            return new NextResponse('INVALID_TOTAL', { status: 400 });
        }

        console.log('>>> [STRIPE_API] Requesting PaymentIntent from Stripe...');

        let paymentIntent;
        const intentParams: any = {
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
                items: cart.map((item: any) => `${item.name} (${item.metadata?.variant_name || 'Basic'})`).join(', '),
                item_details: JSON.stringify(cart.map((item: any) => ({
                    id: item.id,
                    variant_id: item.metadata?.variant_id,
                    type: item.metadata?.type
                }))),
            },
        };

        if (recipient) {
            intentParams.shipping = {
                name: recipient.name,
                address: {
                    line1: recipient.address1,
                    city: recipient.city,
                    state: recipient.state,
                    postal_code: recipient.zip,
                    country: recipient.country_code,
                }
            };
        }

        const existingIntentId = body.paymentIntentId;
        if (existingIntentId) {
            console.log('>>> [STRIPE_API] Updating existing intent:', existingIntentId);
            paymentIntent = await stripe.paymentIntents.update(existingIntentId, intentParams);
        } else {
            console.log('>>> [STRIPE_API] Creating new intent');
            paymentIntent = await stripe.paymentIntents.create({
                ...intentParams,
                automatic_payment_methods: { enabled: true },
            });
        }

        console.log('>>> [STRIPE_API] PaymentIntent Ready:', paymentIntent.id);
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
