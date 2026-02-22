const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

export interface PrintfulProduct {
    id: number;
    external_id: string;
    name: string;
    variants: number;
    synced: number;
    thumbnail_url: string;
    is_ignored: boolean;
}

export interface PrintfulShippingRate {
    id: string;
    name: string;
    rate: string;
    currency: string;
    min_delivery_days?: number;
    max_delivery_days?: number;
}

/**
 * Printful API Client Service
 * Handles catalog fetching, shipping estimation, and order fulfillment.
 */
class PrintfulService {
    private headers = {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': PRINTFUL_STORE_ID || '',
    };

    /**
     * Fetch all synced products from the Printful store.
     */
    async getProducts() {
        if (!PRINTFUL_API_KEY) {
            console.warn('PRINTFUL_API_KEY is not defined. Using mock products.');
            return [
                {
                    id: 1,
                    external_id: 'mock_shirt_001',
                    name: 'HYPERSLUMP // LOGO TEE',
                    variants: 6,
                    synced: 6,
                    thumbnail_url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_1ttktb1ttktb1ttk_cropped_processed_by_imagy.png',
                    is_ignored: false,
                },
                {
                    id: 2,
                    external_id: 'mock_hoodie_001',
                    name: 'LIQUID STATE // OVERSIZED HOODIE',
                    variants: 5,
                    synced: 5,
                    thumbnail_url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_unhreuunhreuunhr_cropped_processed_by_imagy.png',
                    is_ignored: false,
                }
            ] as PrintfulProduct[];
        }

        try {
            const response = await fetch(`${PRINTFUL_API_URL}/store/products`, {
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`Printful API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result as PrintfulProduct[];
        } catch (error) {
            console.error('Failed to fetch Printful products:', error);
            return [];
        }
    }

    /**
     * Fetch details for a specific product including sync variants and mockups.
     */
    async getProduct(productId: number) {
        if (!PRINTFUL_API_KEY) {
            return {
                id: productId,
                name: productId === 1 ? 'HYPERSLUMP // LOGO TEE' : 'LIQUID STATE // OVERSIZED HOODIE',
                sync_variants: [
                    { id: 101, name: 'Small / Black', price: '28.00', retail_price: '35.00', currency: 'USD' },
                    { id: 102, name: 'Medium / Black', price: '28.00', retail_price: '35.00', currency: 'USD' }
                ],
                thumbnail_url: productId === 1
                    ? 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_1ttktb1ttktb1ttk_cropped_processed_by_imagy.png'
                    : 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_unhreuunhreuunhr_cropped_processed_by_imagy.png'
            };
        }

        try {
            const response = await fetch(`${PRINTFUL_API_URL}/store/products/${productId}`, {
                headers: this.headers,
            });

            if (!response.ok) {
                throw new Error(`Printful API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error(`Failed to fetch Printful product ${productId}:`, error);
            return null;
        }
    }

    /**
     * Estimate shipping rates for a given set of items and destination.
     */
    async estimateShipping(recipient: any, items: any[]) {
        try {
            const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ recipient, items }),
            });

            if (!response.ok) {
                throw new Error(`Printful API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result as PrintfulShippingRate[];
        } catch (error) {
            console.error('Failed to estimate shipping rates:', error);
            return [];
        }
    }

    /**
     * Create an order in Printful.
     * By default, creating as 'draft' for safety during development.
     */
    async createOrder(orderData: any, state: 'draft' | 'pending' = 'draft') {
        try {
            const response = await fetch(`${PRINTFUL_API_URL}/orders?confirm=${state === 'pending'}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error(`Printful API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Failed to create Printful order:', error);
            return null;
        }
    }
}

export const printfulService = new PrintfulService();
