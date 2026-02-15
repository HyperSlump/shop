'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MatrixSpace from './MatrixSpace';

const navLinks = [
    { label: 'Shop', href: '/', id: 'shop' },
    { label: 'Blog', href: '/blog', id: 'blog', note: '//SOON' },
    { label: 'About', href: '/about', id: 'about', note: '//INFO' },
    { label: 'Archive', href: '/archive', id: 'archive', note: '//2026' },
    { label: 'Contact', href: '/contact', id: 'contact', note: '//LINK' },
    { label: 'Support', href: '/support', id: 'support', note: '//HELP' },
    { label: 'Docs', href: '/docs', id: 'docs', note: '//GUIDE' }
];

export default function HeroSchema() {
    const [coordinates, setCoordinates] = useState("40.7128° N, 74.0060° W");
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const lat = (40.7128 + (e.clientX / window.innerWidth - 0.5) * 0.1).toFixed(4);
            const lng = (74.0060 + (e.clientY / window.innerHeight - 0.5) * 0.1).toFixed(4);
            setCoordinates(`${lat}° N, ${lng}° W`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] animate-fade-in px-0 pt-0 pb-0">
            {/* MAIN CONTAINER - 100% WIDTH ZERO GAPS */}
            <div className="w-full relative flex flex-col p-4 md:p-6 lg:p-10">

                {/* 1. BRANDING SECTION */}
                <div className="relative w-full flex justify-between items-center mb-4">

                    <div className="flex items-center gap-4">
                        <h1 className="font-gothic text-4xl md:text-5xl tracking-tight lowercase leading-none drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                            <Link href="/" className="hover:text-primary transition-colors duration-300" data-cursor-invert="true">
                                hyper$lump
                            </Link>
                        </h1>
                    </div>

                    {/* Version and Status Info - Top Right */}
                    <div className="hidden md:flex flex-col items-end font-mono text-[9px] opacity-40 tracking-wider uppercase gap-0.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="opacity-40">COORD:</span>
                            <span
                                onClick={() => {
                                    navigator.clipboard.writeText(coordinates);
                                    // Could add a toast here, but for now visual feedback via selection or cursor
                                }}
                                className="text-primary opacity-100 w-[120px] text-right font-mono tabular-nums transition-all duration-300 cursor-crosshair hover:bg-primary/20 hover:text-white select-all"
                                title="Click to Copy System Coordinates"
                            >
                                {coordinates}
                            </span>
                        </div>
                        <div className="h-[1px] w-full bg-primary/20 my-1" />
                        <span>TERMINAL_READY</span>
                        <span>LINK_ESTABLISHED</span>
                        <div className="h-[1px] w-full bg-primary/20 my-1" />
                        <span className="text-primary opacity-60">VERSION: 4.5.BETA</span>
                        <span className="opacity-30">LAST UPDATE: 24.03.18</span>
                    </div>
                </div>

                {/* 2. SECONDARY DATA AREA */}
                <div className="relative w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-1 py-0 transition-all duration-300">
                    {/* Left Data Column - Sys/Cortex Info */}
                    <div className="flex flex-col gap-2 font-mono text-[9px] uppercase tracking-[0.3em] opacity-30 min-w-[250px]">
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Sys: V.4.0.ALPHA</span>
                            <span>[ OK ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Cortex: Link</span>
                            <span className="text-primary opacity-60">ACTIVE_STREAM</span>
                        </div>
                    </div>

                    {/* Right Data Column - Nav Module Label */}
                    <div className="hidden md:flex flex-col items-end justify-end pb-1 opacity-40">
                        <span className="font-mono text-[8px] text-primary uppercase tracking-tighter">Nav_Module.v2</span>
                    </div>

                </div>

                <div className="border-y border-foreground/15 bg-[var(--background)] relative mt-0 py-4 transition-colors duration-300 has-[a:hover]:border-primary/60 group/nav" onMouseLeave={() => setHoveredLink(null)}>

                    <div className="absolute -top-1 left-0 w-2 h-2 border-l border-t border-primary/40" />
                    <div className="absolute -bottom-1 right-0 w-2 h-2 border-r border-b border-primary/40" />

                    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative">
                        {navLinks.map((link, i) => (
                            <div key={link.id} className="relative flex-1 flex items-center justify-center">
                                <a
                                    href={link.href}
                                    onMouseEnter={() => setHoveredLink(link.id)}
                                    // Removed onClick/onFocus handling for hover-only effect logic simplification, 
                                    // but focus should ideally set hover state too for a11y.
                                    onFocus={() => setHoveredLink(link.id)}
                                    style={{ animationDelay: `${100 + i * 100}ms` }}
                                    className="animate-slide-up group relative h-12 w-full flex items-center justify-center px-4 bg-foreground/5 hover:bg-primary/10 border border-transparent transition-all duration-300"
                                >
                                    <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-primary transition-all duration-300" />
                                    <div className="flex flex-col items-center z-10">
                                        <span className="font-mono text-xs tracking-widest uppercase group-hover:text-primary transition-colors">{link.label}</span>
                                        {link.note && (
                                            <span className="text-[8px] opacity-40 group-hover:opacity-80 font-mono scale-75">{link.note}</span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-primary/0 group-hover:bg-primary transition-all duration-300" />

                                    {/* SLIDING BORDERS */}
                                    {hoveredLink === link.id && (
                                        <>
                                            <motion.div
                                                layoutId="nav-highlight-top"
                                                className="absolute -top-[17px] left-0 right-0 h-[1px] bg-primary shadow-[0_0_10px_var(--primary)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                            <motion.div
                                                layoutId="nav-highlight-bottom"
                                                className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-primary shadow-[0_0_10px_var(--primary)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        </>
                                    )}
                                </a>

                                {/* DIVIDER (except last) */}
                                {i < navLinks.length - 1 && (
                                    <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-4 w-[1px] gap-1 opacity-20 pointer-events-none translate-x-[6px]">
                                        <div className="w-[1px] h-2 bg-primary" />
                                        <div className="w-[1px] h-2 bg-primary" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Decorative Tech Legend */}
                <div className="mt-8 flex items-center justify-between font-mono text-[8px] opacity-20 uppercase tracking-[0.4em] w-full border-t border-primary/10 pt-4">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 pulse-slow">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Live_System_Feed
                        </span>
                        <div className="h-[1px] w-16 bg-primary/30" />
                        <span>Build_ID: 01A-X99</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>©2026 HYPER$LUMP_IND_GLOBAL</span>
                        <div className="h-[1px] w-16 bg-primary/30" />
                        <span>ENCRYPTED_SIGNAL_STRENGTH: 100%</span>
                    </div>
                </div>
            </div >

            <style jsx>{`
                .pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
                @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </section >
    );
}
