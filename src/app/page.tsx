import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';
import Navigation from '@/components/Navigation';
import ThemeToggle from '@/components/ThemeToggle';

export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <Navigation />

      <main className="flex-1 flex flex-col">
        <header className="p-4 md:p-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-end gap-6 bg-[var(--background)] animate-fade-in delay-100">
          <div className="flex flex-col">
            <h1 className="hidden md:block font-gothic text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight mb-4 lowercase">
              hyper$lump
            </h1>
            <p className="text-base max-w-lg opacity-80 font-mono">
              Industrial sound design textures, raw synthesis, and broken percussion for the electronic avant-garde.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm uppercase font-bold tracking-[0.2em] text-primary">
              Current Catalog
            </div>
            <div className="text-4xl font-gothic leading-none">
              {products.length} Items
            </div>
          </div>
        </header>

        <ProductGrid products={products} />

        <footer className="p-8 md:p-8 border-t border-[var(--border)] flex flex-col md:grid md:grid-cols-3 gap-8 bg-[var(--background)] items-center md:items-end text-center md:text-left animate-fade-in delay-300">
          <div className="text-[12px] space-y-1.5 opacity-60 hidden md:block">
            <p>&gt; INITIALIZING SYSTEM_CORE...</p>
            <p>&gt; LOADING ASSETS [OK]</p>
            <p>&gt; BUFFERING AUDIO ENGINE [OK]</p>
            <p>&gt; STANDBY FOR SIGNAL...</p>
          </div>
          <div className="flex items-center justify-center w-full">
            <ThemeToggle />
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
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
