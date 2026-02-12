
import { list } from '@vercel/blob';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

async function main() {
    console.log('--- Fetching Stripe Products ---');
    const products = await stripe.products.list({ limit: 100, active: true });

    console.log(`Found ${products.data.length} active products.`);

    console.log('\n--- Fetching Vercel Blob Files ---');
    let blobs: any[] = [];
    try {
        const response = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        blobs = response.blobs;
        console.log(`Found ${blobs.length} blobs.`);
    } catch (error) {
        console.error("Error fetching blobs:", error);
        return;
    }

    console.log('\n--- Linking Products to Blobs ---');

    for (const product of products.data) {
        // Extract number from product name, e.g., "Sample Product 1" -> "1"
        const match = product.name.match(/(\d+)$/);
        if (!match) {
            console.log(`Skipping product "${product.name}" (no number found at end)`);
            continue;
        }

        const number = match[1];
        const expectedFilename = `sample_product_${number}.zip`;

        const blob = blobs.find(b => b.pathname === expectedFilename);

        if (blob) {
            console.log(`Matching "${product.name}" -> ${blob.url}`);

            // Update Stripe Product Metadata
            await stripe.products.update(product.id, {
                metadata: {
                    files: blob.url,
                    key: `test_key_${number}`
                }
            });
            console.log(`Updated metadata for ${product.name}`);
        } else {
            console.log(`No blob found for "${product.name}" (expected ${expectedFilename})`);
        }
    }
}

main().catch(console.error);
