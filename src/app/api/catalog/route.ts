import { NextResponse } from 'next/server';
import { getUnifiedProducts } from '@/lib/services/catalog';

export async function GET() {
    try {
        const products = await getUnifiedProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error('catalog API error', error);
        return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
    }
}
