import { getActiveProducts } from '@/lib/stripe/products';
import ProductGrid from '@/components/ProductGrid';
import Navigation from '@/components/Navigation';
import ThemeToggle from '@/components/ThemeToggle';
import EncryptText from '@/components/EncryptText';
import HeroSchema from '@/components/HeroSchema';
import IndustrialTicker from '@/components/IndustrialTicker';

export const revalidate = 60; // Re-fetch products every 60 seconds

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <>
      <div className="relative min-h-screen bg-[var(--background)]">
        {/* Navigation Sidebar - Fixed and persistent */}
        <Navigation />

        {/* Main Content Area - Shifted for Nav */}
        <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 md:ml-20">
          <HeroSchema productCount={products.length} />

          {/* Product Grid Centered */}
          <section className="flex-1 w-full mx-auto">
            <ProductGrid products={products} />
          </section>
        </main>

        {/* Full Width Ticker - Outside the main margin to TUCK UNDER nav */}
        <footer className="footer-unit animate-fade-in delay-300 relative z-10 w-full overflow-hidden">
          <div className="w-full">
            <IndustrialTicker />
          </div>

          {/* Indented Footer Content */}
          <div className="p-8 md:p-12 md:ml-20 bg-[var(--background)] border-t-2 border-black/10 dark:border-white/5">
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
          </div>
        </footer>
      </div>
    </>
  );
}
