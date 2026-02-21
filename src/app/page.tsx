import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';


export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <>
      <div className="relative bg-transparent">
        {/* Header Section — Matching MockPageLayout exactly */}
        <div className="w-full py-10 space-y-10">
          {/* Header System Line */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
            <div className="space-y-1 pt-4">
              <h1 className="heading-h1 text-4xl md:text-6xl lg:text-8xl">
                the slump store
              </h1>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        <section id="catalog" className="flex-1 w-full scroll-mt-28">
          <ProductGrid products={products} />
        </section>
      </div>
    </>
  );
}
