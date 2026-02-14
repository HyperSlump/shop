
const { getActiveProducts } = require('./src/lib/stripe/products');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        const products = await getActiveProducts();
        console.log('Products fetched:', JSON.stringify(products, null, 2));
        console.log('Count:', products.length);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
