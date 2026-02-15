'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';


export default function Navigation() {
    const { toggleCart, cart } = useCart();

    return (
        <aside className="w-full md:w-20 h-16 md:h-screen sticky top-0 left-0 border-b md:border-b-0 md:border-r border-foreground/15 flex flex-row md:flex-col items-center justify-between px-4 md:p-6 z-50 bg-[var(--background)] animate-fade-in">
            {/* Mobile Title */}
            <Link href="/" className="md:hidden text-xl font-gothic tracking-tighter hover:text-primary transition-colors leading-none font-bold">
                <span>hyper$lump</span>
            </Link>

            {/* Top: Brain / Theme Toggle */}
            <div className="hidden md:flex flex-col items-center gap-6 w-full pt-[52px]">
                <ThemeToggle />
            </div>

            {/* Center: Tools */}
            <nav className="flex md:flex-col gap-6 md:gap-10 items-center w-full">

                <button className="hover:text-primary transition-colors group relative">
                    <span className="material-icons text-xl block transition-transform group-hover:scale-110">filter_list</span>
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center gap-2">
                        <div className="h-[1px] w-4 bg-primary/50" />
                        <span className="text-[10px] font-mono tracking-widest text-primary whitespace-nowrap bg-background px-1">FILTER_GIRD</span>
                    </div>
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
