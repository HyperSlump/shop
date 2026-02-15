import { getActiveProducts } from '@/lib/stripe/products';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const products = await getActiveProducts();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
