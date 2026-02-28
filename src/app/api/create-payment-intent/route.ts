import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    console.log('>>> [STRIPE_API] POST RECEIVED');
    try {
        const body = await req.json();
        const { cart, shippingAmount, taxAmount, recipient, shippingId } = body;

        console.log('>>> [STRIPE_API] Payload received:', JSON.stringify({ cart, shippingAmount, taxAmount, recipient, shippingId }, null, 2));

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            console.error('>>> [STRIPE_API] Validation Failed: Empty or invalid cart');
            return new NextResponse('INVALID_CART_DATA', { status: 400 });
        }

        const normalizeLineQuantity = (item: any): number => {
            const parsedQuantity = Number(item.quantity ?? 1);
            const safeQuantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 1;
            if (item.metadata?.type !== 'PHYSICAL') return 1;
            return Math.max(0, Math.min(10, safeQuantity));
        };

        if (cart.some((item: any) => item.metadata?.type === 'PHYSICAL' && normalizeLineQuantity(item) <= 0)) {
            return NextResponse.json(
                { error: 'Please choose a quantity above 0 or remove highlighted item(s).' },
                { status: 400 }
            );
        }

        const normalizedShippingAmount = Math.max(0, Number(shippingAmount) || 0);
        const normalizedTaxAmount = Math.max(0, Number(taxAmount) || 0);

        // Always calculate total on the server to prevent price tampering
        const productsTotal = cart.reduce(
            (sum: number, item: any) => sum + ((Number(item.amount) || 0) * normalizeLineQuantity(item)),
            0
        );
        const total = productsTotal + normalizedShippingAmount + normalizedTaxAmount;

        console.log('>>> [STRIPE_API] Calculated Total:', total, `(Products: ${productsTotal}, Shipping: ${normalizedShippingAmount}, Tax: ${normalizedTaxAmount})`);

        if (total <= 0) {
            console.error('>>> [STRIPE_API] Total is 0 or negative');
            return new NextResponse('INVALID_TOTAL', { status: 400 });
        }

        console.log('>>> [STRIPE_API] Requesting PaymentIntent from Stripe...');

        let paymentIntent;
        const itemDetailsStr = JSON.stringify(cart.map((item: any) => ({
            id: item.id,
            type: item.metadata?.type || 'DIGITAL',
            v_id: item.metadata?.variant_id || item.selectedVariantId, // Robust mapping
            qty: normalizeLineQuantity(item)
        })));

        const metadata: any = {
            // Keep items list short to avoid char limit
            items: cart.slice(0, 3).map((item: any) => `${(item.name || 'Item').substring(0, 20)}`).join(', ') + (cart.length > 3 ? '...' : ''),
            shipping_id: shippingId || 'STANDARD',
        };

        // Chunk the item details into 450-character strings to bypass Stripe's 500-character single-key limit
        const chunks = itemDetailsStr.match(/.{1,450}/g) || [];
        chunks.forEach((chunk, index) => {
            metadata[`item_details_${index}`] = chunk;
        });

        const intentParams: any = {
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: metadata,
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
            id: paymentIntent.id,
            amount_shipping: normalizedShippingAmount,
            amount_tax: normalizedTaxAmount
        });
    } catch (error: any) {
        console.error('>>> [STRIPE_API] ERROR CAUGHT:', error);

        // Return a cleaner error message to the client
        const message = error.message || 'Internal Server Error';
        const code = error.code || 'UNKNOWN_ERROR';

        return new NextResponse(JSON.stringify({
            error: message,
            code: code,
            type: error.type
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
