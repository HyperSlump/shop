'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HeroSchema from "@/components/HeroSchema";
import HorizontalNav from "@/components/HorizontalNav";
import IndustrialTicker from "@/components/IndustrialTicker";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const isCheckout = pathname === '/checkout';

    return (
        <main className={`flex-1 flex flex-col min-w-0 min-h-screen ${isHome ? 'pt-0' : 'pt-20'}`}>
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
                className={`flex-1 w-full min-h-0 px-3 md:px-5 lg:px-6`}
            >
                {children}
            </motion.div>

            {/* GLOBAL FOOTER — Redesigned Brutalist Variation */}
            <footer className="w-full relative z-10 bg-background border-t border-border">
                {/* Ticker Section */}
                <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
                    <IndustrialTicker />
                </div>

                <div className="px-6 md:px-10 lg:px-12 py-20 max-w-7xl mx-auto">
                    {/* Main Footer Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

                        {/* Huge Brand Signature */}
                        <div className="lg:col-span-6 flex flex-col justify-between space-y-12">
                            <div>
                                <Link
                                    href="/"
                                    className="text-6xl md:text-8xl font-display leading-[0.8] tracking-[-0.05em] hover:text-primary transition-colors duration-500"
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

                        {/* Navigation Grid */}
                        <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-3 gap-12">
                            {/* Inventory */}
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

                            {/* Connectivity */}
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

                            {/* Service */}
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

                {/* Bottom Bar */}
                <div className="w-full border-t border-border py-10 bg-card/30">
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
                                    © hyper$lump protocol. all data encrypted.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
