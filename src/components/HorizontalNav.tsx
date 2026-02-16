'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const navLinks = [
    { label: 'Shop', href: '/', id: 'shop', note: '//MAIN' },
    { label: 'Blog', href: '/blog', id: 'blog', note: '//SOON' },
    { label: 'About', href: '/about', id: 'about', note: '//INFO' },
    { label: 'Archive', href: '/archive', id: 'archive', note: '//2026' },
    { label: 'Contact', href: '/contact', id: 'contact', note: '//LINK' },
    { label: 'Support', href: '/support', id: 'support', note: '//HELP' },
    { label: 'Docs', href: '/docs', id: 'docs', note: '//GUIDE' }
];

export default function HorizontalNav() {
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    return (
        <nav
            className="hidden md:block sticky top-0 z-40 border-y border-foreground/15 bg-[var(--background)] px-4 md:px-7 lg:px-8 py-3 transition-colors group/nav"
            onMouseLeave={() => setHoveredLink(null)}
        >
            {/* 4-Corner Minimal Accents */}
            <div className="absolute top-0 left-0 w-1 h-1 border-l border-t border-primary/40 group-hover/nav:border-primary transition-colors" />
            <div className="absolute top-0 right-0 w-1 h-1 border-r border-t border-primary/40 group-hover/nav:border-primary transition-colors" />
            <div className="absolute bottom-0 left-0 w-1 h-1 border-l border-b border-primary/40 group-hover/nav:border-primary transition-colors" />
            <div className="absolute bottom-0 right-0 w-1 h-1 border-r border-b border-primary/40 group-hover/nav:border-primary transition-colors" />

            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative">
                {navLinks.map((link, i) => (
                    <div key={link.id} className="relative flex-1 flex items-center justify-center">
                        <Link
                            href={link.href}
                            onMouseEnter={() => setHoveredLink(link.id)}
                            onFocus={() => setHoveredLink(link.id)}
                            style={{ animationDelay: `${100 + i * 100}ms` }}
                            className="animate-slide-up group relative h-14 min-w-[120px] flex items-center justify-center px-6 bg-foreground/5 hover:bg-primary/10 border border-transparent transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-primary transition-all duration-300" />
                            <div className="flex flex-col items-center z-10">
                                <span className="font-mono text-base tracking-widest uppercase group-hover:text-primary transition-colors">{link.label}</span>
                                {link.note && (
                                    <span className="text-[11px] opacity-40 group-hover:opacity-80 font-mono">{link.note}</span>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-primary/0 group-hover:bg-primary transition-all duration-300" />

                            {/* SLIDING BORDERS */}
                            {hoveredLink === link.id && (
                                <>
                                    <motion.div
                                        layoutId="nav-highlight-top"
                                        className="absolute -top-[13px] left-0 right-0 h-[1px] bg-primary shadow-[0_0_10px_var(--primary)]"
                                        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                                    />
                                    <motion.div
                                        layoutId="nav-highlight-bottom"
                                        className="absolute -bottom-[13px] left-0 right-0 h-[1px] bg-primary shadow-[0_0_10px_var(--primary)]"
                                        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                                    />
                                </>
                            )}
                        </Link>

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

        </nav>
    );
}
