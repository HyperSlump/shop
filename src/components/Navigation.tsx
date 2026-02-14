'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navigation() {
    const { toggleCart, cart } = useCart();

    return (
        <aside className="w-full md:w-20 md:h-screen sticky top-0 border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20 flex flex-row md:flex-col items-center justify-between p-4 z-40 bg-background-light dark:bg-background-dark">
            <Link href="/" className="text-xl md:text-3xl font-gothic tracking-tighter hover:text-primary transition-colors">
                <span className="md:hidden">hyper$lump</span>
                <span className="hidden md:block">H$</span>
            </Link>
            <nav className="flex md:flex-col gap-6 items-center">
                <button className="hover:text-primary transition-colors">
                    <span className="material-icons">search</span>
                </button>
                <button className="hover:text-primary transition-colors">
                    <span className="material-icons">filter_list</span>
                </button>
                <div className="hidden md:block vertical-text uppercase tracking-widest text-xs font-bold py-8 border-y border-black/10 dark:border-white/10">
                    Archives 2026
                </div>
                <button
                    onClick={toggleCart}
                    className="hover:text-primary transition-colors relative"
                >
                    <span className="material-icons">shopping_cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </nav>
            <div className="hidden md:block text-[10px] text-black/40 dark:text-white/40 vertical-text">
                V.1.0_LIVE
            </div>
        </aside>
    );
}
