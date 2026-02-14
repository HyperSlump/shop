
import { getActiveProducts } from '../src/lib/stripe/products';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Using STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not Set');
    try {
        const products = await getActiveProducts();
        console.log('Products fetched:', JSON.stringify(products, null, 2));
        console.log('Count:', products.length);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
