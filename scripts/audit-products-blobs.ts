
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

    products.data.forEach(p => {
        console.log(`Product: ${p.name} (ID: ${p.id})`);
        console.log(`  Metadata:`, p.metadata);
    });

    console.log('\n--- Fetching Vercel Blob Files ---');
    try {
        const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        blobs.forEach(b => {
            console.log(`Blob: ${b.pathname} (URL: ${b.url})`);
        });
    } catch (error) {
        console.error("Error fetching blobs:", error);
    }
}

main().catch(console.error);
