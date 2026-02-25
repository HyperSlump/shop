import { stripe } from '@/lib/stripe/server';
import { getProductFile } from '@/lib/products';
import Link from 'next/link';
import SuccessClient from '@/components/SuccessClient';
import { getUnifiedProducts } from '@/lib/services/catalog';

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

    const digitalItems = [];
    const physicalItems = [];

    // Try to get items from metadata first (richer data including images and types)
    const metaJson = getChunkedMetadata(session?.metadata, 'item_details');
    if (metaJson) {
        try {
            const parsed = JSON.parse(metaJson);
            for (const item of parsed) {
                const catalogProduct = allProducts.find(p =>
                    p.id === item.id ||
                    p.productId === item.id ||
                    p.id === item.v_id ||
                    p.productId === item.v_id
                );

                const itemData = {
                    id: item.id,
                    name: item.name || catalogProduct?.name || 'Item',
                    image: item.image || catalogProduct?.image,
                    amount: item.amount || catalogProduct?.amount || 0,
                    quantity: item.qty || 1
                };

                if (item.type === 'PHYSICAL') {
                    physicalItems.push(itemData);
                } else {
                    digitalItems.push({
                        ...itemData,
                        id: item.id || item.price_id,
                    });
                }
            }
        } catch (e) {
            console.error('Metadata parse error:', e);
        }
    }



    // Fallback/enrich with Stripe's actual line items if metadata is empty or missing
    if (physicalItems.length === 0 && digitalItems.length === 0 && lineItems.length > 0) {
        for (const item of lineItems) {
            const type = item.metadata?.type || 'DIGITAL';
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
            downloads={downloads}
            physical={physical}
            session={session}
            upsellItems={upsellProducts}
        />
    );
}
