'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSchema from "@/components/HeroSchema";
import HorizontalNav from "@/components/HorizontalNav";
import IndustrialTicker from "@/components/IndustrialTicker";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const isCheckout = pathname === '/checkout';

    return (
        <main className={`relative isolate flex-1 flex flex-col min-w-0 min-h-screen ${isHome || isCheckout ? 'pt-0' : 'pt-20'}`}>
            {!isCheckout && (
                <div className="site-backdrop fixed inset-0 -z-20 pointer-events-none" aria-hidden />
            )}

            {/* Global header */}
            {!isCheckout && <HorizontalNav />}

            {/* Hero only on home page */}
            {isHome && (
                <div className="block">
                    <HeroSchema />
                </div>
            )}

            {/* Page content */}
            <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
                className={`flex-1 w-full min-h-0 ${isCheckout ? '' : 'px-3 md:px-5 lg:px-6'}`}
            >
                {children}
            </motion.div>

            {!isCheckout && (
                <footer className="w-full relative z-10 bg-background/70 backdrop-blur-md border-t border-border">
                    {/* Ticker section */}
                    <div className="w-full border-b border-border bg-card/45 backdrop-blur-sm">
                        <IndustrialTicker />
                    </div>

                    <div className="px-6 md:px-10 lg:px-12 py-20 max-w-7xl mx-auto">
                        {/* Main footer grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
                            {/* Brand */}
                            <div className="lg:col-span-6 flex flex-col justify-between space-y-12">
                                <div>
                                    <Link
                                        href="/"
                                        className="brand-logo-jacquard text-6xl md:text-8xl leading-[0.82] tracking-[-0.02em] hover:text-primary transition-colors duration-500"
                                        style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                                    >
                                        hyper$lump
                                    </Link>
                                    <div className="mt-8 flex items-center gap-4 group">
                                        <div className="h-[1px] w-12 bg-border group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
                                        <p className="text-[10px] font-mono tracking-[0.2em] opacity-40 uppercase">
                                            Digital Waste & Artifacts
                                        </p>
                                    </div>
                                </div>

                                <div className="max-w-md">
                                    <p className="text-xs font-mono leading-relaxed opacity-40 uppercase tracking-tight">
                                        A sonic preservation project documenting the decay of digital synthesis.
                                        We provide raw, industrial textures for the modern wasteland.
                                    </p>
                                </div>
                            </div>

                            {/* Navigation grid */}
                            <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-3 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono opacity-20">[01]</span>
                                        <h4 className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase opacity-30">Archive</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        {['All Packs', 'Sound Disks', 'Presets', 'Artifacts', 'Free Soil'].map((item) => (
                                            <li key={item} className="group overflow-hidden">
                                                <a href="#" className="text-[11px] font-mono uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-primary transition-all block translate-y-0 group-hover:-translate-y-1 duration-300">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono opacity-20">[02]</span>
                                        <h4 className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase opacity-30">Nodes</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        {['Instagram', 'Discord', 'Bandcamp', 'Mixcloud', 'GitHub'].map((item) => (
                                            <li key={item} className="group overflow-hidden">
                                                <a href="#" className="text-[11px] font-mono uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-primary transition-all block translate-y-0 group-hover:-translate-y-1 duration-300">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-span-2 lg:col-span-1 space-y-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono opacity-20">[03]</span>
                                        <h4 className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase opacity-30">Terminal</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        {['Support', 'Recovery', 'F.A.Q', 'System Status'].map((item) => (
                                            <li key={item} className="group overflow-hidden">
                                                <a href="#" className="text-[11px] font-mono uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-primary transition-all block translate-y-0 group-hover:-translate-y-1 duration-300">
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="w-full border-t border-border py-10 bg-card/25 backdrop-blur-sm">
                        <div className="px-6 md:px-10 lg:px-12 max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                                <div className="flex flex-wrap gap-x-12 gap-y-4">
                                    {['Legal', 'Privacy', 'Compliance', 'Tokens'].map((item) => (
                                        <a key={item} href="#" className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-20 hover:opacity-100 hover:text-primary transition-all">
                                            {item}
                                        </a>
                                    ))}
                                </div>

                                <div className="flex flex-col items-start lg:items-end gap-2">
                                    <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
                                        System build: 2026.02.18_v.01
                                    </p>
                                    <p className="text-[9px] font-mono font-bold opacity-30 uppercase tracking-[0.2em]">
                                        (c) hyper$lump protocol. all data encrypted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </main>
    );
}
