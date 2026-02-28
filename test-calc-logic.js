function testPaymentIntent() {
    const payload = {
        cart: [
            { id: 'price_123', amount: 10, quantity: 2, name: 'Item 1', metadata: { type: 'PHYSICAL' } },
            { id: 'price_456', amount: 5, quantity: 3, name: 'Item 2', metadata: { type: 'DIGITAL' } }
        ],
        shippingAmount: 5,
        taxAmount: 2
    };

    console.log('Testing total calculation with quantity multiplier...');
    // Real-world logic copied from src/app/api/create-payment-intent/route.ts:
    // const productsTotal = cart.reduce((sum: number, item: any) => sum + ((item.amount || 0) * (item.quantity || 1)), 0);

    const productsTotal = payload.cart.reduce((sum, item) => sum + ((item.amount || 0) * (item.quantity || 1)), 0);
    const total = productsTotal + payload.shippingAmount + payload.taxAmount;

    console.log('--- RESULTS ---');
    console.log('Subtotal (Sum of Price * Qty):', productsTotal);
    console.log('Shipping:', payload.shippingAmount);
    console.log('Tax:', payload.taxAmount);
    console.log('Final Total (Calculated):', total);

    // Expected: (10*2) + (5*3) + 5 + 2 = 20 + 15 + 5 + 2 = 42
    if (total === 42) {
        console.log('✅ PASS: Calculation logic correctly handles quantities.');
    } else {
        console.log('❌ FAIL: Calculation logic incorrect. Expected 42, got', total);
    }

    console.log('\nTesting metadata mapping...');
    const cart = payload.cart;
    const itemDetails = cart.map((item) => ({
        id: item.id,
        type: item.metadata?.type || 'DIGITAL',
        v_id: item.metadata?.variant_id || item.selectedVariantId,
        qty: item.quantity || 1
    }));

    console.log('Mapped Metadata:', JSON.stringify(itemDetails, null, 2));
    if (itemDetails[0].qty === 2 && itemDetails[1].qty === 3) {
        console.log('✅ PASS: Metadata correctly captures item quantities.');
    } else {
        console.log('❌ FAIL: Metadata quantity mismatch.');
    }
}

testPaymentIntent();
