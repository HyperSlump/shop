'use client';

import { usePathname } from 'next/navigation';
import HeroSchema from "@/components/HeroSchema";
import HorizontalNav from "@/components/HorizontalNav";
import IndustrialTicker from "@/components/IndustrialTicker";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <main className="flex-1 flex flex-col min-w-0 md:pl-20 md:pt-0 min-h-screen">
            {/* GLOBAL HEADER */}
            {/* On mobile: only show hero on home. On desktop: always show. */}
            {/* key={pathname} forces re-mount on navigation so hero always reappears when going home */}
            <div key={pathname} className={`${isHome ? 'block' : 'hidden md:block'}`}>
                <HeroSchema />
            </div>
            <HorizontalNav />

            {/* PAGE CONTENT */}
            <div className="flex-1 w-full">
                {children}

                {/* GLOBAL FOOTER */}
                <footer className="footer-unit animate-fade-in delay-300 relative z-10 w-full overflow-hidden mt-auto">
                    <div className="w-full">
                        <IndustrialTicker />
                    </div>

                    {/* Indented Footer Content */}
                    <div className="px-4 md:px-7 lg:px-8 py-8 md:py-12 bg-[var(--background)] border-t border-foreground/15">
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
            </div>
        </main>
    );
}
