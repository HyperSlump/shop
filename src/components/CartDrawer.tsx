'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setLoading(true);
        toggleCart();
        router.push('/checkout');
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        data-lenis-prevent
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[4px]"
                        onClick={toggleCart}
                    />

                    {/* Drawer panel */}
                    <motion.aside
                        data-lenis-prevent
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                        className="fixed inset-y-0 right-0 h-full w-full md:w-[420px] z-[150] flex flex-col overflow-hidden bg-background border-l border-border shadow-2xl"
                    >
                        {/* ── Header ── */}
                        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-foreground/[0.05]">
                            <div className="flex items-center gap-3">
                                <h2 className="text-base font-semibold text-foreground">
                                    Your cart
                                </h2>
                                {cart.length > 0 && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={toggleCart}
                                className="p-1.5 rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Items ── */}
                        <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                                    <ShoppingCart size={40} strokeWidth={1} />
                                    <p className="text-sm">
                                        Your cart is empty
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {cart.map((item) => (
                                            <div key={item.id} className="relative overflow-hidden group/item">
                                                {/* Swipe Background Action */}
                                                <div className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end px-6 z-0">
                                                    <Trash2 size={20} className="text-white" />
                                                </div>

                                                <motion.div
                                                    layout
                                                    drag="x"
                                                    dragConstraints={{ left: -100, right: 0 }}
                                                    dragElastic={0.1}
                                                    onDragEnd={(_, info) => {
                                                        if (info.offset.x < -60) {
                                                            removeFromCart(item.id);
                                                        }
                                                    }}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="relative py-5 flex items-center gap-4 border-b border-foreground/[0.05] bg-background z-10 transition-colors"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="w-[56px] h-[56px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-foreground/[0.05] bg-foreground/5 dark:bg-foreground/5">
                                                        <NextImage
                                                            src={item.image || 'https://via.placeholder.com/100'}
                                                            alt={item.name}
                                                            width={56}
                                                            height={56}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium leading-snug text-foreground">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs mt-0.5 text-muted-foreground">
                                                            Digital item · Qty 1
                                                        </p>
                                                    </div>

                                                    {/* Price */}
                                                    <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                                        ${(item.amount || 0).toFixed(2)}
                                                    </span>

                                                    {/* Delete (Desktop only or fallback click) */}
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="hidden md:flex flex-shrink-0 w-7 h-7 items-center justify-center rounded-md transition-all duration-150 cursor-pointer text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* ── Footer ── */}
                        {cart.length > 0 && (
                            <div className="flex-shrink-0 px-6 py-6 border-t border-foreground/[0.05]">
                                {/* Totals */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="text-foreground">${(cartTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-muted-foreground">Calculated at checkout</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-4 border-t border-foreground/[0.05]">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-foreground">${(cartTotal || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Checkout button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                    className="w-full h-[44px] rounded-md font-medium text-[15px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-primary text-primary-foreground hover:brightness-110 shadow-[0_4px_12px_rgba(99,91,255,0.25)] dark:shadow-[0_0_20px_rgba(99,91,255,0.2)]"
                                >
                                    {loading ? 'Redirecting…' : 'Continue to checkout'}
                                </button>

                                {/* Trust badge */}
                                <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span>Secured by <strong className="font-semibold text-muted-foreground">stripe</strong></span>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
