import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

type Recipient = {
    address1?: string;
    address2?: string;
    city?: string;
    state_code?: string;
    zip?: string;
    country_code?: string;
};

function normalizeLineQuantity(item: any): number {
    const parsedQuantity = Number(item?.quantity ?? 1);
    const safeQuantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 1;
    if (item?.metadata?.type !== 'PHYSICAL') return 1;
    return Math.max(0, Math.min(10, Math.floor(safeQuantity)));
}

function resolveShipFromAddress() {
    const countryRaw = process.env.STRIPE_TAX_ORIGIN_COUNTRY || process.env.COMPANY_COUNTRY || '';
    const country = countryRaw.trim().toUpperCase();
    if (!country) return null;

    const state = (process.env.STRIPE_TAX_ORIGIN_STATE || process.env.COMPANY_STATE || '').trim().toUpperCase();
    const city = (process.env.STRIPE_TAX_ORIGIN_CITY || process.env.COMPANY_CITY || '').trim();
    const line1 = (process.env.STRIPE_TAX_ORIGIN_LINE1 || process.env.COMPANY_ADDRESS_LINE1 || '').trim();
    const line2 = (process.env.STRIPE_TAX_ORIGIN_LINE2 || process.env.COMPANY_ADDRESS_LINE2 || '').trim();
    const postalCode = (process.env.STRIPE_TAX_ORIGIN_POSTAL_CODE || process.env.COMPANY_POSTAL_CODE || '').trim();

    // Stripe requires postal code for some origin countries (e.g. US/CA).
    if ((country === 'US' || country === 'CA') && !postalCode) {
        return null;
    }

    return { country, state, city, line1, line2, postalCode };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const cart = Array.isArray(body?.cart) ? body.cart : [];
        const recipient = (body?.recipient || {}) as Recipient;
        const shippingAmount = Math.max(0, Number(body?.shippingAmount) || 0);

        if (cart.length === 0) {
            return NextResponse.json({ error: 'Cart is required' }, { status: 400 });
        }

        const normalizedRecipient = {
            address1: String(recipient.address1 || '').trim(),
            address2: String(recipient.address2 || '').trim(),
            city: String(recipient.city || '').trim(),
            state_code: String(recipient.state_code || '').trim().toUpperCase(),
            zip: String(recipient.zip || '').trim(),
            country_code: String(recipient.country_code || '').trim().toUpperCase(),
        };

        const country = normalizedRecipient.country_code;
        if (!country) {
            return NextResponse.json({ error: 'Destination country is required for tax quotes.' }, { status: 400 });
        }
        if (country === 'US' && !normalizedRecipient.zip) {
            return NextResponse.json({ error: 'Postal code is required for US tax calculation.' }, { status: 400 });
        }

        const lineItems = cart
            .map((item: any, index: number) => {
                const quantity = normalizeLineQuantity(item);
                if (quantity <= 0) return null;

                const unitAmount = Number(item?.amount) || 0;
                const amountMinor = Math.round(unitAmount * quantity * 100);
                if (amountMinor <= 0) return null;

                const taxCodeFromMetadata = typeof item?.metadata?.tax_code === 'string'
                    ? item.metadata.tax_code.trim()
                    : '';

                const lineItem: any = {
                    amount: amountMinor,
                    quantity,
                    reference: `${String(item?.id || `line-${index}`)}-${index}`,
                    tax_behavior: 'exclusive',
                };

                // If this cart line originated from a Stripe Product, Stripe can inherit its tax code.
                if (typeof item?.productId === 'string' && item.productId.startsWith('prod_')) {
                    lineItem.product = item.productId;
                } else if (taxCodeFromMetadata) {
                    lineItem.tax_code = taxCodeFromMetadata;
                }

                return lineItem;
            })
            .filter((item: any) => item !== null);

        if (lineItems.length === 0) {
            return NextResponse.json({
                taxAmount: 0,
                totalAmount: 0,
                calculationId: null,
            });
        }

        const taxRequest: any = {
            currency: 'usd',
            line_items: lineItems,
            customer_details: {
                address_source: 'shipping',
                address: {
                    line1: normalizedRecipient.address1 || undefined,
                    line2: normalizedRecipient.address2 || undefined,
                    city: normalizedRecipient.city || undefined,
                    state: normalizedRecipient.state_code || undefined,
                    postal_code: normalizedRecipient.zip || undefined,
                    country,
                },
            },
        };

        if (shippingAmount > 0) {
            taxRequest.shipping_cost = {
                amount: Math.round(shippingAmount * 100),
                tax_behavior: 'exclusive',
            };
        }

        const shipFrom = resolveShipFromAddress();
        if (shipFrom?.country) {
            taxRequest.ship_from_details = {
                address: {
                    country: shipFrom.country,
                    state: shipFrom.state || undefined,
                    city: shipFrom.city || undefined,
                    line1: shipFrom.line1 || undefined,
                    line2: shipFrom.line2 || undefined,
                    postal_code: shipFrom.postalCode || undefined,
                },
            };
        }

        const calculation = await stripe.tax.calculations.create(taxRequest);
        const taxMinor = (calculation.tax_amount_exclusive || 0) + (calculation.tax_amount_inclusive || 0);

        return NextResponse.json({
            calculationId: calculation.id,
            taxAmount: taxMinor / 100,
            totalAmount: calculation.amount_total / 100,
            currency: calculation.currency,
            expiresAt: calculation.expires_at,
        });
    } catch (error: any) {
        console.error('>>> [TAX_QUOTE] Error:', error);
        const message = error?.message || 'Unable to calculate taxes right now.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
