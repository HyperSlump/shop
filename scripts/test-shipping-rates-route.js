const assert = require('node:assert/strict');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const baseUrl = process.env.TEST_APP_URL || 'http://localhost:3000';

async function fetchJson(url, init) {
    const response = await fetch(url, init);
    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 240)}`);
    }

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}) for ${url}: ${JSON.stringify(data)}`);
    }

    return data;
}

async function run() {
    console.log(`[shipping-rates-test] Using app URL: ${baseUrl}`);

    const apiKey = process.env.PRINTFUL_API_KEY;
    const storeId = process.env.PRINTFUL_STORE_ID;
    assert(apiKey, 'PRINTFUL_API_KEY is required for this integration test');
    assert(storeId, 'PRINTFUL_STORE_ID is required for this integration test');

    const printfulHeaders = {
        Authorization: `Bearer ${apiKey}`,
        'X-PF-Store-Id': storeId,
    };

    const productList = await fetchJson('https://api.printful.com/store/products', {
        headers: printfulHeaders,
    });

    const firstProductId = productList?.result?.[0]?.id;
    assert(firstProductId, 'No synced Printful products found');

    const productDetails = await fetchJson(`https://api.printful.com/store/products/${firstProductId}`, {
        headers: printfulHeaders,
    });

    const syncProduct = productDetails?.result?.sync_product;
    const syncVariants = productDetails?.result?.sync_variants || [];
    const firstVariant = syncVariants.find((variant) => variant?.synced) || syncVariants[0];
    assert(firstVariant, 'No synced Printful variants found');

    const syncVariantId = String(firstVariant.id);
    const catalogVariantId = String(firstVariant.variant_id || firstVariant.id);
    const retailPrice = String(firstVariant.retail_price || '0.00');
    const productName = syncProduct?.name || 'Printful Product';
    const printfulProductId = String(syncProduct?.id || 'test');

    const payload = {
        recipient: {
            address1: '123 Main St',
            city: 'Los Angeles',
            state_code: 'CA',
            zip: '90012',
            country_code: 'US',
        },
        items: [
            {
                id: `pf_${printfulProductId}_${syncVariantId}`,
                name: productName,
                amount: parseFloat(retailPrice),
                quantity: 1,
                selectedVariantId: syncVariantId,
                selectedCatalogVariantId: catalogVariantId,
                metadata: {
                    type: 'PHYSICAL',
                    printful_id: printfulProductId,
                    variant_id: syncVariantId,
                    catalog_variant_id: catalogVariantId,
                },
            },
        ],
    };

    const quote = await fetchJson(`${baseUrl}/api/printful/shipping-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    assert(Array.isArray(quote.rates), 'Expected quote.rates to be an array');
    assert(typeof quote.tax === 'number', 'Expected quote.tax to be a number');
    assert(quote.rates.length > 0, 'Expected at least one shipping rate option');

    const cheapest = [...quote.rates].sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate))[0];
    console.log(`[shipping-rates-test] PASS - rates: ${quote.rates.length}, cheapest: $${cheapest.rate}, tax: $${quote.tax.toFixed(2)}`);
}

run().catch((error) => {
    console.error('[shipping-rates-test] FAIL:', error.message || error);
    process.exit(1);
});
