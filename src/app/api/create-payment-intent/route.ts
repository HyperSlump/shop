import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
    console.log('>>> [STRIPE_API] POST RECEIVED');
    try {
        const body = await req.json();
        const { cart, shippingAmount, taxAmount, recipient, shippingId, taxCalculationId } = body;
        const uiMode = body.uiMode === 'light' ? 'light' : 'dark';

        console.log('>>> [STRIPE_API] Payload received:', JSON.stringify({ cart, shippingAmount, taxAmount, recipient, shippingId, taxCalculationId }, null, 2));

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
        let normalizedTaxAmount = Math.max(0, Number(taxAmount) || 0);

        // Always calculate total on the server to prevent price tampering
        const productsTotal = cart.reduce(
            (sum: number, item: any) => sum + ((Number(item.amount) || 0) * normalizeLineQuantity(item)),
            0
        );
        const hasPhysicalItems = cart.some((item: any) => item.metadata?.type === 'PHYSICAL' && normalizeLineQuantity(item) > 0);
        const hasCompleteRecipient = Boolean(
            recipient?.address1 &&
            recipient?.city &&
            recipient?.zip &&
            recipient?.country_code
        );

        // Suppress unused variable warnings
        void hasPhysicalItems;
        void hasCompleteRecipient;

        let resolvedTaxCalculationId: string | null = null;
        let total = productsTotal + normalizedShippingAmount + normalizedTaxAmount;

        if (taxCalculationId) {
            const calculation = await stripe.tax.calculations.retrieve(String(taxCalculationId));
            const taxMinor = (calculation.tax_amount_exclusive || 0) + (calculation.tax_amount_inclusive || 0);
            const subtotalMinor = calculation.amount_total - taxMinor;
            const expectedSubtotalMinor = Math.round((productsTotal + normalizedShippingAmount) * 100);

            if (Math.abs(subtotalMinor - expectedSubtotalMinor) > 1) {
                return NextResponse.json(
                    { error: 'Tax quote is out of sync. Please re-enter your address.' },
                    { status: 400 }
                );
            }

            normalizedTaxAmount = taxMinor / 100;
            total = calculation.amount_total / 100;
            resolvedTaxCalculationId = calculation.id || null;
        }

        console.log('>>> [STRIPE_API] Calculated Total:', total, `(Products: ${productsTotal}, Shipping: ${normalizedShippingAmount}, Tax: ${normalizedTaxAmount})`);

        // Free order — fulfill inline without Stripe payment
        if (total <= 0) {
            console.log('>>> [STRIPE_API] Zero-total order — fulfilling as free download');
            try {
                const { supabaseAdmin } = await import('@/lib/supabase/admin');
                const { resend } = await import('@/lib/resend');
                const { getProductFile } = await import('@/lib/products');
                const { buildDownloadEmail } = await import('@/lib/email/downloadEmail');

                const customerEmail = recipient?.email || body.email;
                const digitalItems = cart.filter((item: any) => item.metadata?.type === 'DIGITAL');
                const freeSessionId = `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

                if (digitalItems.length > 0 && customerEmail) {
                    // Save purchase records to Supabase
                    const purchases = digitalItems.map((item: any) => ({
                        customer_email: customerEmail,
                        stripe_session_id: freeSessionId,
                        price_id: item.id || '',
                        is_verified: true,
                    }));
                    await supabaseAdmin.from('purchases').insert(purchases);

                    // Resolve direct download URLs per item
                    const downloadItems = digitalItems.map((item: any) => {
                        const fileInfo = getProductFile(item.id);
                        return { name: item.name, label: fileInfo.label, downloadUrl: fileInfo.url };
                    });

                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hyperslump.xyz';
                    const html = buildDownloadEmail({
                        customerEmail,
                        items: downloadItems,
                        sessionId: freeSessionId,
                        appUrl,
                        uiMode,
                    });

                    await resend.emails.send({
                        from: 'hyper$lump <onboarding@resend.dev>',
                        to: customerEmail,
                        subject: 'Your download is ready — hyper$lump',
                        html,
                    });

                    console.log(`>>> [STRIPE_API] Free download email sent to ${customerEmail}`);

                    // Return download items so the frontend can persist and display them
                    return NextResponse.json({
                        freeOrder: true,
                        sessionId: freeSessionId,
                        downloads: digitalItems.map((item: any) => {
                            const fileInfo = getProductFile(item.id);
                            return {
                                id: item.id,
                                name: item.name,
                                image: item.image,
                                url: fileInfo.url,
                                label: fileInfo.label,
                            };
                        }),
                    });
                }

                return NextResponse.json({ freeOrder: true, sessionId: freeSessionId });
            } catch (freeErr) {
                console.error('>>> [STRIPE_API] Free order fulfillment error:', freeErr);
                return new NextResponse('FREE_ORDER_FULFILLMENT_FAILED', { status: 500 });
            }
        }

        console.log('>>> [STRIPE_API] Requesting PaymentIntent from Stripe...');

        let paymentIntent;
        const itemDetailsStr = JSON.stringify(cart.map((item: any) => ({
            id: item.id,
            type: item.metadata?.type || 'DIGITAL',
            v_id: item.metadata?.variant_id || item.selectedVariantId,
            qty: normalizeLineQuantity(item)
        })));

        const metadata: any = {
            items: cart.slice(0, 3).map((item: any) => `${(item.name || 'Item').substring(0, 20)}`).join(', ') + (cart.length > 3 ? '...' : ''),
            shipping_id: shippingId || 'STANDARD',
            ui_mode: uiMode,
        };
        if (resolvedTaxCalculationId) {
            metadata.tax_calculation_id = resolvedTaxCalculationId;
        }

        // Chunk item details into 450-char strings to bypass Stripe's 500-char single-key limit
        const chunks = itemDetailsStr.match(/.{1,450}/g) || [];
        chunks.forEach((chunk, index) => {
            metadata[`item_details_${index}`] = chunk;
        });

        const intentParams: any = {
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: metadata,
        };

        if (resolvedTaxCalculationId) {
            intentParams.hooks = {
                inputs: {
                    tax: {
                        calculation: resolvedTaxCalculationId,
                    },
                },
            };
        }

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
            amount_tax: normalizedTaxAmount,
            tax_calculation_id: resolvedTaxCalculationId
        });
    } catch (error: any) {
        console.error('>>> [STRIPE_API] ERROR CAUGHT:', error);

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
