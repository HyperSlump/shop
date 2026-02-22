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
            mode: 'payment',
            line_items: cart.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [],
                        description: item.description || undefined,
                        metadata: {
                            id: item.id,
                            type: item.metadata?.type || 'DIGITAL'
                        }
                    },
                    unit_amount: Math.round(item.amount * 100),
                },
                quantity: 1,
            })),
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU'], // Expand as needed
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 800, currency: 'usd' },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 1800, currency: 'usd' },
                        display_name: 'Express Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 1 },
                            maximum: { unit: 'business_day', value: 3 },
                        },
                    },
                },
            ],
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/checkout`,
            payment_intent_data: {
                metadata: {
                    item_details: JSON.stringify(cart.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        variant_id: item.metadata?.variant_id,
                        type: item.metadata?.type || 'DIGITAL'
                    }))),
                }
            },
            metadata: {
                item_details: JSON.stringify(cart.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    variant_id: item.metadata?.variant_id,
                    type: item.metadata?.type || 'DIGITAL'
                }))),
            }
        });

        console.log('[API] Session created successfully:', session.id);
        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[API] Stripe Session Creation Failed:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
