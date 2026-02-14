import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';
import Navigation from '@/components/Navigation';

export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <Navigation />

      <main className="flex-1 flex flex-col">
        <header className="p-4 md:p-8 border-b border-black/20 dark:border-white/20 flex flex-col md:flex-row justify-between items-end gap-6 bg-background-light dark:bg-background-dark">
          <div>
            <h1 className="font-gothic text-6xl md:text-9xl leading-none tracking-tight uppercase">
              hyper$lump
            </h1>
            <p className="mt-2 text-sm max-w-md opacity-80">
              Industrial sound design textures, raw synthesis, and broken percussion for the electronic avant-garde.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase font-bold tracking-widest text-primary">
              Current Catalog
            </div>
            <div className="text-4xl font-gothic leading-none">
              {products.length} Items
            </div>
          </div>
        </header>

        <ProductGrid products={products} />

        <footer className="p-4 md:p-8 border-t border-black/20 dark:border-white/20 grid grid-cols-1 md:grid-cols-3 gap-8 bg-background-light dark:bg-background-dark">
          <div className="text-[10px] space-y-1 opacity-60">
            <p>&gt; INITIALIZING SYSTEM_CORE...</p>
            <p>&gt; LOADING ASSETS [OK]</p>
            <p>&gt; BUFFERING AUDIO ENGINE [OK]</p>
            <p>&gt; STANDBY FOR SIGNAL...</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="border border-black dark:border-white p-4 text-center">
              <div className="text-[8px] uppercase tracking-[0.4em] mb-2 opacity-50">
                Authorized License
              </div>
              <div className="font-mono text-xs font-bold">#492-X-99-ALPHA</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
              <a className="text-xs hover:text-primary underline" href="#">
                INSTAGRAM
              </a>
              <a className="text-xs hover:text-primary underline" href="#">
                DISCORD
              </a>
              <a className="text-xs hover:text-primary underline" href="#">
                BANDCAMP
              </a>
            </div>
            <p className="text-[10px] opacity-40">
              ©2026 ACID GOTH LABS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </main>


    </div>
  );
}
