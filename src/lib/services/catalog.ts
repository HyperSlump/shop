import { getActiveProducts } from '@/lib/stripe/products';
import { printfulService } from './printfulService';
import { Product } from '@/components/CartProvider';

/**
 * Unified Catalog Service
 * Merges Stripe (Digital) and Printful (Physical) products into a single interface.
 */

export async function getUnifiedProducts(): Promise<Product[]> {
    try {
        const [stripeProducts, printfulProductsList] = await Promise.all([
            getActiveProducts(),
            printfulService.getProducts()
        ]);

        // Fetch full details for each Printful product to get accurate pricing and descriptions
        const printfulProducts = await Promise.all(
            printfulProductsList.map(p => printfulService.getProduct(p.id))
        );

        const unifiedStripe: Product[] = stripeProducts.map(p => ({
            id: p.id,
            productId: p.productId,
            name: p.name,
            description: p.description,
            image: p.image,
            currency: p.currency,
            amount: p.amount,
            metadata: {
                ...(p.metadata as Record<string, string>),
                type: 'DIGITAL'
            }
        }));

        const VERCEL_BLOB_BASE = 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com';

        // Smart Mapping: Automatically check for higher-quality transparent mockups
        // named pf_{printful_id}.png in your Vercel Blob storage.
        const IMAGE_OVERRIDES: Record<string, string> = {
            '420681159': `${VERCEL_BLOB_BASE}/classic-dad-hat-black-front-699a3d27d359e.png`,
            // Add more manual overrides here if they don't follow the naming convention
        };

        const unifiedPrintful = (printfulProducts.map(fullProduct => {
            if (!fullProduct || !fullProduct.sync_product) return null;
            const p = fullProduct.sync_product;
            const variants = fullProduct.sync_variants || [];

            const printfulId = String(p.id);
            const finalImage = IMAGE_OVERRIDES[printfulId] || p.thumbnail_url;

            // Get price from the first variant
            const amount = variants.length > 0 ? parseFloat(variants[0].retail_price) : 32.00;

            const product: Product = {
                id: `pf_${p.id}`,
                productId: p.external_id,
                name: p.name,
                description: p.description || 'Exclusive physical merchandise. Professionally printed on demand and shipped globally.',
                image: finalImage,
                currency: 'usd',
                amount: amount,
                metadata: {
                    type: 'PHYSICAL',
                    printful_id: printfulId,
                    format: 'PHYSICAL',
                    count: `${variants.length} options`
                },
                variants: variants.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    retail_price: v.retail_price,
                    currency: v.currency
                }))
            };
            return product;
        }).filter((p): p is Product => p !== null));

        return [...unifiedStripe, ...unifiedPrintful];
    } catch (error) {
        console.error('Error fetching unified products:', error);
        return [];
    }
}

export async function getUnifiedProductById(id: string): Promise<Product | undefined> {
    const products = await getUnifiedProducts();
    // Match by ID (price id for stripe, pf_id for printful) or productId (external id)
    return products.find(p => p.id === id || p.productId === id);
}
