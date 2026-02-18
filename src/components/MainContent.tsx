'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSchema from "@/components/HeroSchema";
import HorizontalNav from "@/components/HorizontalNav";
import IndustrialTicker from "@/components/IndustrialTicker";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <main className="flex-1 flex flex-col min-w-0 md:pt-0 min-h-screen">
            {/* GLOBAL HEADER */}
            <HorizontalNav />
            {/* Hero only on home page */}
            {isHome && (
                <div className="block">
                    <HeroSchema />
                </div>
            )}

            {/* PAGE CONTENT - Fast, smooth entry transition */}
            <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
                className={`flex-1 w-full ${pathname === '/checkout' ? '' : 'max-w-6xl mx-auto'}`}
            >
                {children}
            </motion.div>

            {/* GLOBAL FOOTER — ticker spans full width, content is centered */}
            <footer className="footer-unit relative z-10 w-full overflow-hidden mt-auto">
                <div className="w-full">
                    {isHome && <IndustrialTicker />}
                </div>

                {/* Indented Footer Content */}
                <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-[var(--background)] border-t border-foreground/15 max-w-6xl mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-12 items-center md:items-center">
                        {/* System Status (Left) */}
                        <div className="flex flex-col gap-4 font-mono w-full text-center md:text-left">
                            <div className="text-[10px] space-y-2 opacity-50 uppercase">
                                <p>&gt; INITIALIZING SYSTEM_CORE...</p>
                                <p>&gt; ASSET_LOAD: 100% [OK]</p>
                                <p>&gt; AUDIO_BUFFER: CACHED [OK]</p>
                                <p>&gt; SIGNAL_STATE: BROADCASTING</p>
                            </div>
                        </div>

                        {/* Spacer (Center) */}
                        <div className="hidden md:block" />

                        {/* Social & Credits (Right) */}
                        <div className="flex flex-col items-center md:items-end gap-3 w-full">
                            <div className="flex gap-6 mb-3">
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
                            <p className="text-[9px] opacity-40 font-mono tracking-tighter uppercase text-center md:text-right">
                                ©2026 HYPER$LUMP // CORTEX_SYNTHESIS_HUB // ALL_RIGHTS_RESERVED
                            </p>

                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
