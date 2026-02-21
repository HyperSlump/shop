'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { IconShoppingCart } from '@tabler/icons-react';

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
    const [isScrolled, setIsScrolled] = useState(false);
    const { toggleCart, cart } = useCart();
    const pathname = usePathname();
    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navOpacityClass = isHome
        ? (isScrolled ? 'bg-background/95 border-b border-border text-foreground' : 'bg-transparent border-transparent text-white')
        : 'bg-background/95 border-b border-border text-foreground';

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 backdrop-blur-[2px] ${navOpacityClass} group/nav`}
                onMouseLeave={() => setHoveredLink(null)}
            >
                <div className="w-full max-w-[1400px] mx-auto px-3 md:px-5 lg:px-6 h-20 flex items-center justify-between relative">
                    {/* LEFT: Logo */}
                    <div className="flex-shrink-0 w-[140px] flex justify-start">
                        <Link
                            href="/"
                            className="brand-logo-jacquard text-[3.2rem] md:text-[3.6rem] leading-none tracking-tight hover:text-primary transition-all duration-150 ease-out"
                            style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                        >
                            h$
                        </Link>
                    </div>

                    {/* CENTER: Links (Desktop) */}
                    <div className="hidden lg:flex items-center justify-center flex-1">
                        <div className="flex items-center justify-between w-full max-w-3xl px-8">
                            {navLinks.map((link) => (
                                <div key={link.id} className="relative group/link">
                                    <Link
                                        href={link.href}
                                        onMouseEnter={() => setHoveredLink(link.id)}
                                        onFocus={() => setHoveredLink(link.id)}
                                        className="group relative h-12 flex flex-col items-center justify-center px-4 transition-all duration-150 ease-out rounded-sm"
                                    >
                                        <span className="jacquard-24-regular lowercase text-[1.2rem] md:text-[1.28rem] tracking-[0.04em] leading-none group-hover:text-primary transition-colors duration-150 ease-out z-10">
                                            {link.label}
                                        </span>
                                        {link.note && (
                                            <span className="text-[9px] opacity-25 group-hover:opacity-60 font-mono uppercase tracking-tighter z-10 mt-0.5 transition-opacity duration-150 ease-out">{link.note}</span>
                                        )}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Controls */}
                    <div className="flex-shrink-0 w-[140px] flex items-center justify-end gap-4 md:gap-6">
                        <div className="hidden lg:block">
                            <ThemeToggle />
                        </div>

                        <button
                            onClick={toggleCart}
                            className="hidden lg:flex p-2.5 hover:text-primary transition-colors relative group"
                        >
                            <IconShoppingCart size={22} stroke={2} className="group-hover:scale-110 transition-transform" />
                            {cart.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-primary text-black text-[10px] font-black w-4.5 h-4.5 rounded-xs flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
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
                            className="lg:hidden site-backdrop border-t border-border overflow-hidden text-foreground"
                        >
                            <div className="flex flex-col p-6 gap-2">
                                <div className="flex items-center justify-between mb-4 px-4">
                                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">System Settings</span>
                                    <ThemeToggle />
                                </div>
                                <div className="h-[1px] bg-border/50 mb-4 mx-4" />
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between rounded-sm"
                                    >
                                        <span className="jacquard-24-regular lowercase text-[1.2rem] leading-none tracking-[0.04em]">
                                            {link.label}
                                        </span>
                                        <span className="text-[10px] uppercase opacity-30">{link.note}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* FIXED MOBILE CART ICON — outside nav to avoid stacking context issues */}
            <div className="lg:hidden fixed bottom-6 right-6 z-[110]">
                <button
                    onClick={toggleCart}
                    className="w-14 h-14 bg-card/90 backdrop-blur-md text-foreground border border-border rounded-sm shadow-lg flex items-center justify-center relative active:scale-95 transition-transform"
                >
                    <IconShoppingCart size={24} stroke={2.5} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
        </>
    );
}
