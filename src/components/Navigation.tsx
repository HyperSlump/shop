'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import CursorTooltip from './CursorTooltip';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
    const { toggleCart, cart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <aside className="w-full md:w-20 h-16 md:h-screen sticky top-0 left-0 border-b md:border-b-0 md:border-r border-foreground/15 flex flex-row md:flex-col items-center justify-between px-4 md:p-6 z-50 bg-[var(--background)] animate-fade-in">
                {/* Mobile Header: Title + Hamburger */}
                <div className="flex w-full items-center justify-between md:hidden">
                    <Link href="/" className="text-xl font-gothic tracking-tighter hover:text-primary transition-colors leading-none font-bold">
                        <span>hyper$lump</span>
                    </Link>

                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 -mr-2 text-primary focus:outline-none transition-transform active:scale-95"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
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
            <div
                className={`fixed inset-0 z-[100] bg-[var(--background)]/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none py-10'
                    }`}
            >
                <div className="flex flex-col h-full p-6 pt-24">
                    {/* Primary Links */}
                    <div className="flex-1 flex flex-col justify-center space-y-12 mb-12">
                        {[
                            { label: 'Shop', href: '/', id: 'shop' },
                            { label: 'Blog', href: '/blog', id: 'blog' },
                            { label: 'About', href: '/about', id: 'about' },
                            { label: 'Archive', href: '/archive', id: 'archive' },
                            { label: 'Contact', href: '/contact', id: 'contact' }
                        ].map((link, i) => (
                            <Link
                                key={link.id}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-5xl font-gothic tracking-tighter transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                                    }`}
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                <span className="hover:text-primary">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Trio: Controls & Links */}
                    <div className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-8">
                        <button
                            onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                            className="flex flex-col items-center justify-center p-6 border border-primary/20 bg-primary/5 rounded-sm relative"
                        >
                            <span className="material-icons text-3xl mb-2">shopping_cart</span>
                            <span className="font-mono text-[10px] tracking-widest uppercase">CART</span>
                            {cart.length > 0 && (
                                <span className="absolute top-4 right-4 bg-primary text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        <div className="flex flex-col items-center justify-center p-6 border border-foreground/10 rounded-sm">
                            <ThemeToggle />
                            <span className="font-mono text-[10px] tracking-widest uppercase mt-2">THEME</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Close Bar */}
                <button
                    onClick={toggleMobileMenu}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-16 border border-primary/40 rounded-full flex items-center justify-center text-primary active:scale-90 transition-transform"
                >
                    <X size={32} />
                </button>
            </div>
        </>
    );
}
