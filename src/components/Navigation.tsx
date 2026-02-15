'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import CursorTooltip from './CursorTooltip';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
    const { toggleCart, cart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <aside className="w-full md:w-20 h-16 md:h-screen sticky top-0 left-0 md:border-r border-foreground/15 flex flex-row md:flex-col items-center justify-between px-4 md:p-6 z-50 bg-transparent md:bg-[var(--background)] animate-fade-in pointer-events-none md:pointer-events-auto">
                {/* Mobile Floating Action Bar */}
                <div className="flex w-full items-center justify-between md:hidden pointer-events-none fixed top-0 left-0 p-4 z-[110]">
                    <Link href="/" className="text-xl font-gothic tracking-tighter hover:text-primary transition-colors leading-none font-bold pointer-events-auto drop-shadow-md">
                        <span>hyper$lump</span>
                    </Link>

                    <div className="flex gap-2 pointer-events-auto">
                        {/* Mobile Dedicated Theme Switch */}
                        <div className="flex items-center justify-center w-12 h-12 bg-[var(--background)]/80 backdrop-blur-sm border md:border-none border-foreground/10 rounded-full shadow-lg">
                            <ThemeToggle />
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="w-12 h-12 flex items-center justify-center bg-primary text-black rounded-full shadow-lg active:scale-90 transition-transform"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[100] bg-[var(--background)] dark:bg-black md:hidden flex flex-col justify-center overflow-hidden"
                    >
                        <div className="flex flex-col h-full items-center justify-between p-8 py-20 overflow-y-auto">
                            {/* Primary Links */}
                            <div className="flex flex-col items-center space-y-8 my-auto w-full">
                                {[
                                    { label: 'Shop', href: '/', id: 'shop' },
                                    { label: 'Blog', href: '/blog', id: 'blog' },
                                    { label: 'About', href: '/about', id: 'about' },
                                    { label: 'Archive', href: '/archive', id: 'archive' },
                                    { label: 'Contact', href: '/contact', id: 'contact' }
                                ].map((link, i) => (
                                    <motion.div
                                        key={link.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            delay: i * 0.05
                                        }}
                                        className="w-full text-center"
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-5xl md:text-6xl font-gothic tracking-tighter transition-all hover:text-primary active:scale-95 block py-1"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mobile Actions Overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-full grid grid-cols-1 gap-4 mt-12"
                            >
                                <button
                                    onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-4 p-6 bg-primary text-black font-bold uppercase tracking-widest text-lg rounded-sm active:scale-95 transition-transform"
                                >
                                    <span className="material-icons">shopping_cart</span>
                                    VIEW_CART ({cart.length})
                                </button>
                            </motion.div>

                            {/* Circular Close Button at bottom */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleMobileMenu}
                                className="mt-12 w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X size={32} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
