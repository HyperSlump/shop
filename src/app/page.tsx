import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';
import EncryptText from '@/components/EncryptText';

export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <>
      <div className="relative bg-[var(--background)]">
        {/* Product Grid Centered */}
        <section className="flex-1 w-full mx-auto">
          <ProductGrid products={products} />
        </section>
      </div>
    </>
  );
}
