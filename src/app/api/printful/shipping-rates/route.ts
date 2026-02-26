import { NextResponse } from 'next/server';
import { printfulService } from '@/lib/services/printfulService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { recipient, items } = body;

        if (!recipient || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing recipient or items' }, { status: 400 });
        }

        // Map cart items to Printful item format
        // We only care about physical items for Printful shipping estimation
        const physicalItems = items
            .filter((item: any) => item.metadata?.type === 'PHYSICAL')
            .map((item: any) => {
                // Find the selected variant object or default to the first one
                const selectedVariant = item.variants?.find((v: any) => String(v.id) === String(item.selectedVariantId)) || item.variants?.[0];

                // The shipping rates API expects the Printful Catalog variant_id, NOT the Sync variant_id
                const variantId = selectedVariant?.catalog_variant_id
                    || item.metadata?.variant_id
                    || selectedVariant?.id;

                console.log('>>> [SHIPPING_API] Item mapping for:', item.name);
                console.log('>>> [SHIPPING_API] Item metadata raw variant_id:', item.metadata?.variant_id);
                console.log('>>> [SHIPPING_API] Selected Variant ID (Sync):', selectedVariant?.id);
                console.log('>>> [SHIPPING_API] Selected Variant Catalog ID:', selectedVariant?.catalog_variant_id);
                console.log('>>> [SHIPPING_API] Chosen variant_id for payload:', parseInt(variantId));

                return {
                    variant_id: parseInt(variantId),
                    quantity: 1, // Currently assuming quantity 1 per item added to cart
                };
            })
            .filter((item: any) => !isNaN(item.variant_id));

        if (physicalItems.length === 0) {
            // No physical items, shipping is zero or not applicable
            return NextResponse.json({ rates: [] });
        }

        const estimate = await printfulService.estimateCosts(recipient, physicalItems);

        console.log('>>> [SHIPPING_API] Incoming recipient payload:', recipient);
        console.log('>>> [SHIPPING_API] Printful estimate result:', estimate);

        // Printful returns tax and vat as strings. We want to return them as numbers.
        const taxAmount = (parseFloat(estimate.costs?.tax || '0') + parseFloat(estimate.costs?.vat || '0'));

        return NextResponse.json({
            rates: estimate.shipping_rates || [],
            tax: taxAmount
        });
    } catch (error: any) {
        console.error('>>> [SHIPPING_API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
