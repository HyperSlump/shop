import { NextResponse } from 'next/server';
import { printfulService } from '@/lib/services/printfulService';

/**
 * Lightweight shipping estimate endpoint for the product page.
 * Accepts: { country_code, state_code?, variant_id, quantity? }
 * Returns the cheapest and fastest shipping options.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { country_code, state_code, variant_id, quantity = 1 } = body;

        if (!country_code || !variant_id) {
            return NextResponse.json(
                { error: 'Missing country_code or variant_id' },
                { status: 400 }
            );
        }

        const recipient: Record<string, string> = { country_code };
        if (state_code) recipient.state_code = state_code;

        const items = [
            {
                variant_id: parseInt(variant_id),
                quantity: parseInt(quantity) || 1,
            },
        ];

        const rates = await printfulService.estimateShipping(recipient, items);

        if (!rates || rates.length === 0) {
            return NextResponse.json({ rates: [], message: 'No shipping options available for this destination.' });
        }

        // Sort by price ascending
        const sorted = [...rates].sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

        return NextResponse.json({ rates: sorted });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Shipping estimate API error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
