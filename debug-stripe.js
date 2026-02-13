require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const fs = require('fs');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkProducts() {
    try {
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
            limit: 20,
        });

        let output = '';
        output += `Found ${prices.data.length} prices\n`;
        const hosts = new Set();
        let sampleUrl = '';

        prices.data.forEach(p => {
            const product = p.product;
            const image = product.images?.[0];
            if (image) {
                try {
                    const url = new URL(image);
                    hosts.add(url.hostname);
                    if (!sampleUrl) sampleUrl = image;
                } catch (e) {
                    output += `Product: ${product.name} - Invalid URL: ${image}\n`;
                }
            }
        });

        output += 'Unique Image Hosts:\n';
        hosts.forEach(h => output += h + '\n');

        if (sampleUrl) {
            output += 'SAMPLE_URL: ' + sampleUrl + '\n';
        } else {
            output += 'NO SAMPLE URL FOUND\n';
        }

        fs.writeFileSync('debug_output.txt', output);
        console.log('Done writing to debug_output.txt');

    } catch (e) {
        console.error(e);
    }
}

checkProducts();
