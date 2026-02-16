'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import CursorTooltip from './CursorTooltip';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import MatrixSpace from './MatrixSpace';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
    const { toggleCart, cart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <aside className="w-full md:w-20 md:h-screen sticky top-0 left-0 md:border-r border-foreground/15 flex flex-row md:flex-col items-center justify-between px-0 md:p-6 z-[145] bg-[var(--background)] md:bg-[var(--background)] animate-fade-in">
                {/* Mobile Sticky Control Bar */}
                <div className="flex md:hidden w-full items-center justify-between p-4 border-b border-foreground/15 bg-[var(--background)] relative z-[110]">
                    <Link href="/" className="text-xl font-gothic tracking-tighter hover:text-primary transition-colors leading-none font-bold">
                        <span>hyper$lump</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Mobile Dedicated Theme Switch */}
                        <div className="flex items-center justify-center w-10 h-10 border border-foreground/10 rounded-full">
                            <ThemeToggle />
                        </div>

                        {/* Hamburger Button - Now matches brain icon style */}
                        <button
                            onClick={toggleMobileMenu}
                            className="w-10 h-10 flex items-center justify-center border border-foreground/10 rounded-full hover:text-primary active:scale-90 transition-all"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* DESKTOP SIDEBAR: PRECISION DISTRIBUTED TRIO */}
                <div className="hidden md:flex flex-col items-center w-full h-full relative py-12">
                    {/* 1. TOP: Brain (Theme Control) - Anchored Top */}
                    <div className="flex flex-col items-center">
                        <ThemeToggle />
                    </div>

                    {/* 2. CENTER: Shopping Cart - Absolute Centered at 50vh Axis */}
                    <div className="absolute top-[calc(50%-40px)] left-0 w-full h-[80px] flex items-center justify-center pointer-events-none">
                        <CursorTooltip text="VIEW_CART_MGR">
                            <button
                                onClick={toggleCart}
                                className="hover:text-primary transition-colors relative group p-4 pointer-events-auto"
                            >
                                <span className="material-icons text-[32px] block transition-transform group-hover:scale-110 font-bold">shopping_cart</span>
                                {cart.length > 0 && (
                                    <span className="absolute top-2 right-2 bg-primary text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-subtle shadow-[0_0_15_rgba(var(--primary-rgb),0.5)] border-2 border-background">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                        </CursorTooltip>
                    </div>

                    {/* 3. BOTTOM: Contact icon - Anchored Bottom */}
                    <div className="mt-auto flex flex-col items-center">
                        <CursorTooltip text="REACH_CONTACT_DIR">
                            <button className="hover:text-primary transition-colors relative group p-4 opacity-40 hover:opacity-100 transition-opacity">
                                <span className="material-icons text-[28px] block transition-transform group-hover:scale-110">alternate_email</span>
                            </button>
                        </CursorTooltip>
                    </div>
                </div>
            </aside>

            {/* MOBILE NAVIGATION MODAL */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[140] bg-[var(--background)] md:hidden flex flex-col justify-center overflow-hidden"
                    >
                        {/* Immersive Background */}
                        <div className="absolute inset-0 z-0 opacity-[0.8] dark:opacity-[0.4] pointer-events-none">
                            <MatrixSpace isVisible={isMobileMenuOpen} />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]" />
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary/20" />
                        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary/20" />
                        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary/20" />
                        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary/20" />

                        <div className="flex flex-col h-full items-center justify-between p-8 py-20 relative z-10">
                            {/* Decorative Label */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] opacity-30 uppercase">
                                System_Directory_V.4
                            </div>

                            {/* Primary Links */}
                            <div className="flex flex-col items-center space-y-4 my-auto w-full">
                                {[
                                    { label: 'Shop', href: '/', id: 'shop' },
                                    { label: 'Blog', href: '/blog', id: 'blog' },
                                    { label: 'About', href: '/about', id: 'about' },
                                    { label: 'Archive', href: '/archive', id: 'archive' },
                                    { label: 'Contact', href: '/contact', id: 'contact' }
                                ].map((link, i) => (
                                    <motion.div
                                        key={link.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: i * 0.08
                                        }}
                                        className="w-full text-center"
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-6xl md:text-7xl font-gothic tracking-tighter transition-all hover:text-primary active:scale-95 block py-2 drop-shadow-2xl"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mobile Actions Overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="w-full flex flex-col items-center gap-6 mt-12"
                            >
                                <button
                                    onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-4 w-full p-6 bg-primary text-black font-bold uppercase tracking-widest text-lg rounded-sm active:scale-95 transition-transform"
                                >
                                    <span className="material-icons">shopping_cart</span>
                                    VIEW_CART ({cart.length})
                                </button>

                                <div className="flex items-center gap-8 opacity-40 font-mono text-[10px] tracking-[0.2em]">
                                    <span>STATUS: ONLINE</span>
                                    <span className="w-1 h-1 rounded-full bg-primary" />
                                    <span>ENCRYPTED_LINK_ACTIVE</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
