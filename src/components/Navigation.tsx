'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navigation() {
    const { toggleCart, cart } = useCart();

    return (
        <aside className="w-full md:w-20 h-16 md:h-screen fixed top-0 left-0 border-b md:border-b-0 md:border-r-4 border-[var(--border)] flex flex-row md:flex-col items-center justify-between px-4 md:py-8 z-50 bg-[var(--background)] animate-fade-in">
            {/* Mobile Title */}
            <Link href="/" className="md:hidden text-xl font-gothic tracking-tighter hover:text-primary transition-colors leading-none font-bold">
                <span>hyper$lump</span>
            </Link>

            {/* Centered Navigation Module */}
            <nav className="flex md:flex-col gap-4 md:gap-6 items-center md:m-auto">
                <button className="hover:text-primary transition-colors group">
                    <span className="material-icons text-xl block transition-transform group-hover:scale-110">search</span>
                </button>
                <button className="hover:text-primary transition-colors group">
                    <span className="material-icons text-xl block transition-transform group-hover:scale-110">filter_list</span>
                </button>
                <button
                    onClick={toggleCart}
                    className="hover:text-primary transition-colors relative group"
                >
                    <span className="material-icons text-xl block transition-transform group-hover:scale-110 font-bold">shopping_cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-subtle">
                            {cart.length}
                        </span>
                    )}
                </button>
            </nav>

            {/* Bottom Status Text */}
            <div className="hidden md:block text-[9px] text-foreground/50 vertical-text tracking-[0.3em] font-mono font-bold">
                V.1.0_SYS_READY
            </div>
        </aside>
    );
}
