import { NextResponse } from 'next/server';
import { getUnifiedProducts } from '@/lib/services/catalog';

export async function GET() {
    try {
        const products = await getUnifiedProducts();
        const jacket = products.find((p) => {
            const name = (p.name || '').toLowerCase();
            const id = (p.id || '').toLowerCase();
            const external = (p.productId || '').toLowerCase();
            return (
                p.metadata?.type === 'PHYSICAL' &&
                (name.includes('jacket') || id.includes('jacket') || external.includes('jacket'))
            );
        });

        if (!jacket) {
            return NextResponse.json({ found: false });
        }

        // Prefer a graphite-labeled variant image if present
        const variantGraphite = jacket.variants?.find((v) =>
            (v.name || '').toLowerCase().includes('graphite') ||
            (v.name || '').toLowerCase().includes('grey') ||
            (v.name || '').toLowerCase().includes('gray')
        );

        const image = variantGraphite?.image || jacket.image || null;
        const href = `/product/${encodeURIComponent(jacket.id)}`;

        return NextResponse.json({
            found: true,
            image,
            href,
            name: jacket.name,
        });
    } catch (error) {
        console.error('graphite-jacket API error', error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
