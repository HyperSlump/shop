import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: Request) {
    try {
        const { cart } = await req.json();
        console.log('[API] Received cart for checkout:', cart?.length, 'items');

        if (!cart || cart.length === 0) {
            console.error('[API] Cart validation failed: Empty cart');
            return new NextResponse('Cart is empty', { status: 400 });
        }

        console.log('[API] Contacting Stripe for Embedded Session...');
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: cart.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [],
                        metadata: {
                            id: item.id
                        }
                    },
                    unit_amount: Math.round(item.amount * 100), // Stripe expects cents
                },
                quantity: 1, // Digital assets are single units
            })),
            mode: 'payment',
            return_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            automatic_tax: { enabled: false },
        });

        console.log('[API] Session created successfully:', session.id);
        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (error: any) {
        console.error('[API] Stripe Session Creation Failed:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
