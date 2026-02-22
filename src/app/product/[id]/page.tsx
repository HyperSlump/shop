import { getUnifiedProductById } from '@/lib/services/catalog';
import { notFound } from 'next/navigation';
import ProductPageLayout from '@/components/ProductPageLayout';

// Force dynamic behavior
export const dynamic = 'force-dynamic';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getUnifiedProductById(id);

    if (!product) {
        notFound();
    }

    return <ProductPageLayout product={product} />;
}
