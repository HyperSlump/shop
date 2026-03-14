import { stripe } from '@/lib/stripe/server';
import { getProductFile } from '@/lib/products';
import Link from 'next/link';
import SuccessClient from '@/components/SuccessClient';
import { getUnifiedProducts } from '@/lib/services/catalog';

function toPlain<T>(value: T): T {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value)) as T;
}

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string; payment_intent?: string }>;
}) {
    const { session_id, payment_intent } = await searchParams;
    const orderId = session_id || payment_intent;

    const getChunkedMetadata = (metadata: any, keyPrefix: string) => {
        if (!metadata) return null;
        if (metadata[keyPrefix]) return metadata[keyPrefix]; // legacy single key

        let result = '';
        let i = 0;
        while (metadata[`${keyPrefix}_${i}`]) {
            result += metadata[`${keyPrefix}_${i}`];
            i++;
        }
        return result || null;
    };

    if (!orderId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground font-mono">
                <div className="border border-alert/30 p-8 rounded bg-alert/10 backdrop-blur-sm">
                    <h1 className="heading-h1 text-xl mb-4">ERROR: SESSION_NOT_FOUND</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    // Free order — skip Stripe lookup, build synthetic session and pull items from Supabase
    if (session_id?.startsWith('free_')) {
        const { supabaseAdmin } = await import('@/lib/supabase/admin');
        const { data: purchases } = await supabaseAdmin
            .from('purchases')
            .select('*')
            .eq('stripe_session_id', session_id);

        const allProducts = await getUnifiedProducts();
        const downloads = (purchases || []).map((p: any) => {
            const fileInfo = getProductFile(p.price_id);
            const catalogProduct = allProducts.find((prod: any) => prod.id === p.price_id);
            return {
                id: p.price_id,
                name: catalogProduct?.name || fileInfo.label,
                image: catalogProduct?.image,
                url: fileInfo.url,
                label: fileInfo.label,
                amount: catalogProduct?.amount || 0,
            };
        });

        const customerEmail = purchases?.[0]?.customer_email || null;
        const upsellProducts = allProducts.filter((p: any) => p.metadata?.type === 'PHYSICAL').slice(0, 3);

        return (
            <SuccessClient
                downloads={downloads}
                physical={[]}
                session={{ metadata: {}, customer_details: { email: customerEmail } }}
                upsellItems={upsellProducts}
            />
        );
    }

    // Verify session or payment intent
    let session: any;
    let lineItems: any[] = [];

    try {
        if (session_id) {
            session = await stripe.checkout.sessions.retrieve(session_id, {
                expand: ['line_items', 'line_items.data.price.product']
            });
            lineItems = session.line_items?.data || [];
        } else if (payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(payment_intent);
            session = pi;

            const itemsJson = getChunkedMetadata(pi.metadata, 'item_details');
            if (itemsJson) {
                const parsedItems = JSON.parse(itemsJson);
                lineItems = parsedItems.map((item: any) => ({
                    description: item.name,
                    amount_total: Math.round((item.amount || 0) * 100),
                    metadata: { type: item.type, ...item },
                    price: { id: item.id }
                }));
            }
        }
    } catch (err) {
        console.error('Success verification error:', err);
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground font-mono">
                <div className="border border-alert/30 p-8 rounded bg-alert/10 backdrop-blur-sm">
                    <h1 className="heading-h1 text-xl mb-4">ERROR: INVALID_TRANSMISSION</h1>
                    <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    // Fetch all products to pick some physical ones for upsell AND for fallback image matching
    const allProducts = await getUnifiedProducts();

    const digitalItems: Array<Record<string, any>> = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const physicalItems: Array<Record<string, any>> = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Try to get items from metadata first (richer data including images and types)
    const metaJson = getChunkedMetadata(session?.metadata, 'item_details');
    if (metaJson) {
        try {
            const parsed = JSON.parse(metaJson);
            for (const item of parsed) {
                const variantIdFromCompositeId = typeof item.id === 'string' && item.id.startsWith('pf_')
                    ? item.id.split('_').pop()
                    : undefined;
                const variantId = item.v_id ?? item.variant_id ?? variantIdFromCompositeId;
                const itemId = item.id || item.price_id || '';
                const explicitType = String(item.type || '').toUpperCase();
                const inferredPhysical = explicitType === 'PHYSICAL' || String(itemId).startsWith('pf_') || Boolean(variantId);

                if (inferredPhysical) {
                    const physicalCatalog = allProducts.find((p) =>
                        p.metadata?.type === 'PHYSICAL' && (
                            p.id === itemId ||
                            p.productId === itemId ||
                            p.variants?.some((v) => String(v.id) === String(variantId))
                        )
                    );
                    const matchedVariant = physicalCatalog?.variants?.find((v) => String(v.id) === String(variantId));
                    const resolvedAmount = Number(
                        item.amount ??
                        matchedVariant?.retail_price ??
                        physicalCatalog?.amount ??
                        0
                    );
                    const parsedQuantity = Number(item.qty ?? item.quantity ?? 1);

                    physicalItems.push({
                        id: itemId || physicalCatalog?.id || String(variantId || 'physical_item'),
                        name: item.name || physicalCatalog?.name || 'Physical item',
                        image: item.image || matchedVariant?.image || physicalCatalog?.image,
                        amount: Number.isFinite(resolvedAmount) ? resolvedAmount : 0,
                        quantity: Number.isFinite(parsedQuantity) ? Math.max(1, parsedQuantity) : 1,
                    });
                    continue;
                }

                const catalogProduct = allProducts.find((p) =>
                    p.metadata?.type !== 'PHYSICAL' && (p.id === itemId || p.productId === itemId)
                );
                digitalItems.push({
                    id: itemId,
                    name: item.name || catalogProduct?.name || 'Digital item',
                    image: item.image || catalogProduct?.image,
                    amount: Number(item.amount || catalogProduct?.amount || 0),
                });
            }
        } catch (e) {
            console.error('Metadata parse error:', e);
        }
    }



    // Fallback/enrich with Stripe's actual line items if metadata is empty or missing
    if (physicalItems.length === 0 && digitalItems.length === 0 && lineItems.length > 0) {
        for (const item of lineItems) {
            const type = item.metadata?.type || (String(item.price?.id || '').startsWith('pf_') ? 'PHYSICAL' : 'DIGITAL');
            let productImage: string | undefined;

            // Check if product is expanded
            const product = item.price?.product;
            if (product && typeof product !== 'string' && 'images' in product && Array.isArray(product.images) && product.images.length > 0) {
                productImage = product.images[0];
            } else if (item.metadata?.image) {
                productImage = item.metadata.image;
            } else {
                // Try catalog lookup as last resort
                const catalogProduct = allProducts.find(p => p.id === item.price?.id || p.productId === item.price?.product);
                if (catalogProduct?.image) {
                    productImage = catalogProduct.image;
                }
            }

            const itemData = {
                id: item.price?.id || 'unknown',
                name: item.description || 'Unknown Item',
                amount: (item.amount_total || 0) / 100,
                image: productImage,
                quantity: item.quantity || 1,
            };

            if (type === 'PHYSICAL') {
                physicalItems.push(itemData);
            } else {
                digitalItems.push(itemData);
            }
        }
    }

    const downloads = digitalItems.map(item => {
        const fileInfo = getProductFile(item.id);
        return {
            ...item,
            url: fileInfo.url,
            label: fileInfo.label,
        };
    });

    const physical = physicalItems;

    const upsellProducts = allProducts
        .filter(p => p.metadata?.type === 'PHYSICAL')
        .slice(0, 3); // Pick first 3 physical items for upsell

    return (
        <SuccessClient
            downloads={toPlain(downloads)}
            physical={toPlain(physical)}
            session={toPlain(session)}
            upsellItems={toPlain(upsellProducts)}
        />
    );
}
