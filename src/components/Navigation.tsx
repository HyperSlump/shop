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

            {/* Top: Brain / Theme Toggle / Connection Status */}
            <div className="hidden md:flex flex-col items-center gap-6 w-full pt-[32px]">
                <div className="flex flex-col items-center gap-1.5 opacity-40">
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase rotate-180 vertical-text py-2 border-r border-primary/20">connection_secure</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                </div>
                <ThemeToggle />
                <div className="h-[2px] w-8 bg-primary/20" />
            </div>

            {/* Center: Tools */}
            <nav className="flex md:flex-col gap-6 md:gap-10 items-center w-full">

                <button className="hover:text-primary transition-colors group relative">
                    <span className="material-icons text-2xl block transition-transform group-hover:scale-110">filter_list</span>
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-primary/50" />
                        <span className="text-[11px] font-mono tracking-widest text-primary whitespace-nowrap bg-background px-1">FILTER_GRID</span>
                    </div>
                </button>
                <button
                    onClick={toggleCart}
                    className="hover:text-primary transition-colors relative group"
                >
                    <span className="material-icons text-2xl block transition-transform group-hover:scale-110 font-bold">shopping_cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-black text-[11px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce-subtle shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]">
                            {cart.length}
                        </span>
                    )}
                </button>

                {/* Industrial Payment Badges Decor */}
                <div className="hidden md:flex flex-col items-center gap-6 pt-6 opacity-30 group-hover:opacity-60 transition-opacity">
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-icons text-lg">verified</span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.2em] vertical-text">TRANS_READY</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-icons text-lg">lock</span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.2em] vertical-text">ENCRYPTED_V4</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-icons text-lg">bolt</span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.2em] vertical-text">DIRECT_FETCH</span>
                    </div>
                </div>
            </nav>

            {/* Bottom Status Text - Increased size */}
            <div className="hidden md:flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-sm border border-primary/20 flex items-center justify-center group/qr cursor-help overflow-hidden">
                    <div className="w-full h-full p-1 opacity-40 group-hover/qr:opacity-100 transition-opacity flex flex-wrap gap-[1px]">
                        {/* Mini QR design */}
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`w-[6px] h-[6px] ${Math.random() > 0.5 ? 'bg-primary' : 'bg-transparent'}`} />
                        ))}
                    </div>
                </div>
                <div className="text-[11px] text-foreground/50 vertical-text tracking-[0.3em] font-mono font-bold uppercase">
                    V.1.0_ACQUIRE_SYS
                </div>
            </div>
        </aside>
    );
}
