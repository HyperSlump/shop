import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: Request) {
    try {
        const { cart } = await req.json();

        if (!cart || cart.length === 0) {
            return new NextResponse('Cart is empty', { status: 400 });
        }

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

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
