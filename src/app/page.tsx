import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';
import Navigation from '@/components/Navigation';
import ThemeToggle from '@/components/ThemeToggle';
import IndustrialTicker from '@/components/IndustrialTicker';

export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-x-hidden bg-[var(--background)]">
      {/* Navigation Sidebar */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-6 md:p-12 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-end gap-10 bg-[var(--background)] animate-fade-in delay-100">
          <div className="flex flex-col">
            <h1 className="hidden md:block font-gothic text-7xl md:text-8xl lg:text-9xl leading-[0.8] tracking-tight mb-6 lowercase">
              hyper$lump
            </h1>
            <p className="text-sm md:text-base max-w-xl opacity-80 font-mono leading-relaxed">
              Industrial sound design textures, raw synthesis, and broken percussion for the electronic avant-garde. Optimized for professional digital production.
            </p>
          </div>
          <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-primary/20 pl-4 md:pl-0 md:pr-4 py-2">
            <div className="text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] text-primary mb-1">
              Current Catalog
            </div>
            <div className="text-3xl md:text-5xl font-gothic leading-none">
              {products.length} Items
            </div>
          </div>
        </header>

        {/* Product Grid Centered */}
        <section className="flex-1 w-full mx-auto">
          <ProductGrid products={products} />
        </section>

        {/* Industrial Ticker (Kinetic Tape) */}
        <div className="w-full py-12">
          <IndustrialTicker />
        </div>

        {/* Footer Balanced */}
        <footer className="p-8 md:p-12 border-t border-[var(--border)] bg-[var(--background)] animate-fade-in delay-300">
          <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-12 items-center md:items-center">
            {/* System Status (Left) */}
            <div className="text-[10px] space-y-2 opacity-50 font-mono w-full text-center md:text-left">
              <p>&gt; INITIALIZING SYSTEM_CORE...</p>
              <p>&gt; ASSET_LOAD: 100% [OK]</p>
              <p>&gt; AUDIO_BUFFER: CACHED [OK]</p>
              <p>&gt; SIGNAL_STATE: BROADCASTING</p>
            </div>

            {/* Theme Control (Center) */}
            <div className="flex justify-center w-full">
              <ThemeToggle />
            </div>

            {/* Social & Credits (Right) */}
            <div className="flex flex-col items-center md:items-end gap-6 w-full">
              <div className="flex gap-6">
                {['INSTAGRAM', 'DISCORD', 'BANDCAMP'].map((platform) => (
                  <a
                    key={platform}
                    className="text-[10px] font-bold tracking-widest hover:text-primary transition-all underline decoration-primary/20 hover:decoration-primary"
                    href="#"
                  >
                    {platform}
                  </a>
                ))}
              </div>
              <p className="text-[9px] opacity-40 font-mono tracking-tighter uppercase">
                ©2026 HYPER$LUMP // CORTEX_SYNTHESIS_HUB // ALL_RIGHTS_RESERVED
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
