'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart } from 'lucide-react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { toggleCart, cart } = useCart();
    const pathname = usePathname();

    return (
        <nav
            className="sticky top-0 z-[100] border-b border-foreground/15 bg-[var(--background)]/80 backdrop-blur-md transition-colors group/nav"
            onMouseLeave={() => setHoveredLink(null)}
        >
            {/* 4-Corner Minimal Accents - Hidden on checkout */}
            {pathname !== '/checkout' && (
                <>
                    <div className="absolute top-0 left-0 w-1 h-1 border-l border-t border-primary/40 group-hover/nav:border-primary transition-colors" />
                    <div className="absolute top-0 right-0 w-1 h-1 border-r border-t border-primary/40 group-hover/nav:border-primary transition-colors" />
                </>
            )}

            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between relative">
                {/* LEFT: Logo */}
                <div className="flex-shrink-0 min-w-[100px] flex justify-start">
                    <Link href="/" className="text-3xl font-gothic tracking-tighter hover:text-primary transition-all duration-300">
                        h$
                    </Link>
                </div>

                {/* CENTER: Links (Desktop) - Filling White Space Evenly */}
                <div className="hidden lg:flex items-center justify-between flex-1 px-8 xl:px-20 max-w-4xl mx-auto">
                    {navLinks.map((link) => (
                        <div key={link.id} className="relative group/link">
                            <Link
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.id)}
                                onFocus={() => setHoveredLink(link.id)}
                                className="group relative h-12 flex flex-col items-center justify-center px-4 hover:bg-primary/5 transition-all duration-300 rounded"
                            >
                                <span className="font-mono text-[11px] md:text-[12px] tracking-[0.3em] uppercase group-hover:text-primary transition-colors z-10">{link.label}</span>
                                {link.note && (
                                    <span className="text-[9px] opacity-25 group-hover:opacity-60 font-mono tracking-tighter z-10 mt-0.5">{link.note}</span>
                                )}

                                {hoveredLink === link.id && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-2 right-2 h-[1px] bg-primary shadow-[0_0_15px_var(--primary)]"
                                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                                    />
                                )}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Controls */}
                <div className="flex-shrink-0 min-w-[100px] flex items-center justify-end gap-3 md:gap-5">
                    <ThemeToggle />

                    <button
                        onClick={toggleCart}
                        className="p-2.5 hover:text-primary transition-colors relative group"
                    >
                        <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                        {cart.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-primary text-black text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* MOBILE NAVIGATION DROPDOWN */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[var(--background)] border-t border-foreground/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 font-mono text-sm uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between"
                                >
                                    <span>{link.label}</span>
                                    <span className="text-[10px] opacity-30">{link.note}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
