'use client';

import { useCart } from './CartProvider';
import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    const handleRemoveItem = (id: string) => {
        removeFromCart(id);
    };

    const handleCheckout = async () => {
        setLoading(true);
        toggleCart(); // Close the cart
        router.push('/checkout');
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140]"
                        onClick={toggleCart}
                    />

                    {/* Drawer */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="fixed inset-y-0 right-0 h-full w-full md:w-[480px] bg-[#0A0A0A] border-l border-white/10 z-[150] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Subtle Noise for texture */}
                        <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none noise" />

                        <header className="flex justify-between items-start p-10 relative z-10 bg-[#0A0A0A]">
                            <Link href="/" onClick={toggleCart} className="group relative">
                                <span className="text-4xl font-gothic tracking-tighter text-white hover:text-primary transition-all duration-300">
                                    h$
                                </span>
                            </Link>

                            <button
                                onClick={toggleCart}
                                className="group p-2 -mr-2 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto px-10 custom-scrollbar relative z-10">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <ShoppingCart size={48} strokeWidth={1} />
                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] mt-6">System empty</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {cart.map((item, i) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="py-8 flex items-center gap-6 group"
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 relative shrink-0 border border-white/10 rounded-lg overflow-hidden bg-white/[0.03]">
                                                    <NextImage
                                                        src={item.image || 'https://via.placeholder.com/100'}
                                                        alt={item.name}
                                                        fill
                                                        className="object-contain contrast-125 grayscale group-hover:grayscale-0 transition-all duration-500"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-1">{item.name}</h3>
                                                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em]">
                                                            Digital Asset • Qty 1
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono text-[12px] text-white/70">
                                                            ${(item.amount || 0).toFixed(2)}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="block ml-auto mt-2 text-[8px] font-mono uppercase tracking-widest text-red-500/20 hover:text-red-500 transition-colors"
                                                        >
                                                            [RMV]
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto bg-[#0A0A0A] p-10 space-y-10 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                                    <span>Subtotal</span>
                                    <span className="text-white/60">${(cartTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                                    <span>Tax</span>
                                    <span className="text-white/60">—</span>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 pb-2">Total</span>
                                    <span className="font-mono text-4xl font-bold text-white tracking-tighter">
                                        ${(cartTotal || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                    className="relative w-full bg-white text-black font-bold uppercase py-6 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-3 text-xs tracking-[0.4em] rounded"
                                >
                                    {loading ? 'INITIALIZING...' : 'Proceed to Checkout'}
                                </button>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-white/10">
                                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                        </svg>
                                        <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Secured by SSL / Stripe</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
