import { NextResponse } from 'next/server';
import { printfulService } from '@/lib/services/printfulService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { recipient, items } = body;

        if (!recipient || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing recipient or items' }, { status: 400 });
        }

        // Map cart items to Printful item format
        // We only care about physical items for Printful shipping estimation
        const physicalItems = items
            .filter((item: any) => item.metadata?.type === 'PHYSICAL')
            .map((item: any) => ({
                variant_id: parseInt(item.metadata?.variant_id),
                quantity: 1, // Currently assuming quantity 1 per item added to cart
            }));

        if (physicalItems.length === 0) {
            // No physical items, shipping is zero or not applicable
            return NextResponse.json({ rates: [] });
        }

        const rates = await printfulService.estimateShipping(recipient, physicalItems);

        return NextResponse.json({ rates });
    } catch (error: any) {
        console.error('Shipping rates API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
