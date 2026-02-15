'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import NextImage from 'next/image';
import { ArrowRight, Trash2 } from 'lucide-react';
import MatrixSpace from './MatrixSpace';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);

    const handleRemoveItem = (id: string) => {
        removeFromCart(id);
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineItems: cart.map((item) => ({ priceId: item.id })),
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error initiating checkout');
            }
        } catch (e) {
            console.error(e);
            alert('Checkout failed');
        } finally {
            setLoading(false);
        }
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
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
                        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--background)] border-l-0 md:border-l-2 border-foreground/10 z-[70] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Matrix Background Texture */}
                        <div className="absolute inset-0 z-0 opacity-[0.9] dark:opacity-[0.6] pointer-events-none">
                            <MatrixSpace isVisible={isCartOpen} />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/60 to-[var(--background)]" />
                        </div>

                        <header className="flex justify-between items-center mb-0 border-b-2 border-foreground/10 p-4 md:p-6 pb-4 md:pb-6 relative z-10">
                            <div className="flex flex-col">
                                <div className="text-[10px] md:text-base uppercase font-bold tracking-[0.2em] text-primary">
                                    Current Cart
                                </div>
                                <div className="text-2xl md:text-4xl font-gothic leading-none text-foreground mt-1">
                                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                                </div>
                            </div>
                            <button
                                onClick={toggleCart}
                                className="hover:translate-x-1 active:scale-95 transition-all text-primary/70 hover:text-primary px-2 md:px-4 flex items-center gap-2 group"
                            >
                                <span className="font-mono text-[10px] md:text-[12px] uppercase tracking-widest opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity">Close</span>
                                <ArrowRight size={20} className="md:w-6 md:h-6" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar relative z-10">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <span className="material-icons text-7xl md:text-9xl">shopping_cart</span>
                                    <p className="font-mono text-xs md:text-sm uppercase tracking-widest mt-4">Buffer_Empty</p>
                                </div>
                            ) : (
                                <div className="space-y-3 md:space-y-4">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {cart.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{
                                                    opacity: 0,
                                                    x: -40,
                                                    scale: 0.9,
                                                    transition: { duration: 0.2 }
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    damping: 25,
                                                    stiffness: 300,
                                                    opacity: { duration: 0.2 }
                                                }}
                                                drag="x"
                                                dragConstraints={{ left: -100, right: 0 }}
                                                onDragEnd={(_, info) => {
                                                    if (info.offset.x < -80) {
                                                        handleRemoveItem(item.id);
                                                    }
                                                }}
                                                className="relative group bg-foreground/[0.03] border border-foreground/10 rounded-sm p-3 md:p-4 h-28 md:h-32 flex items-center gap-3 md:gap-4 touch-none"
                                            >
                                                {/* Swipe Indicator (Visible only on swipe) */}
                                                <div className="absolute inset-0 right-0 bg-red-500/20 -z-10 flex items-center justify-end px-6 transition-opacity opacity-0 group-active:opacity-100 pointer-events-none">
                                                    <Trash2 className="text-red-500" size={24} />
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 md:w-20 md:h-20 relative shrink-0 border border-foreground/10 bg-[var(--background)]">
                                                    <NextImage
                                                        src={item.image || 'https://via.placeholder.com/100'}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover contrast-110 grayscale group-hover:grayscale-0 transition-all duration-500"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col min-w-0">
                                                            <h3 className="font-gothic text-lg md:text-xl leading-none text-foreground truncate max-w-[120px] md:max-w-full">{item.name}</h3>
                                                            <span className="font-mono text-[9px] opacity-40 uppercase mt-0.5 tracking-widest">
                                                                REF_{item.id.slice(0, 6)}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-xs md:text-sm font-bold text-primary">
                                                            ${(item.amount || 0).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {/* Prominent Desktop Action */}
                                                    <div className="flex justify-end pt-1">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="flex items-center gap-2 p-1.5 px-2.5 bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 text-red-500/60 hover:text-red-500 transition-all group/del"
                                                        >
                                                            <span className="font-mono text-[9px] tracking-widest uppercase hidden md:inline">Delete</span>
                                                            <Trash2 size={12} className="group-hover/del:scale-110 transition-transform md:w-3.5 md:h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>


                        <div className="mt-auto border-t-2 border-foreground/10 p-4 md:p-6 pt-4 md:pt-6 space-y-3 md:space-y-4 bg-[var(--background)] relative z-10">
                            <div className="flex justify-between font-mono text-lg md:text-xl font-bold tracking-tighter text-foreground">
                                <span className="opacity-60 text-foreground">SUBTOTAL_</span>
                                <span className="text-primary">${(cartTotal || 0).toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || loading}
                                className="group/checkout relative w-full bg-primary text-primary-foreground font-bold uppercase py-4 md:py-5 overflow-hidden transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm md:text-base tracking-widest"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/checkout:translate-x-[100%] transition-transform duration-700 ease-in-out"
                                />
                                {loading ? (
                                    <>
                                        <span className="material-icons animate-spin text-sm">refresh</span>
                                        SYNCING_PURCHASE...
                                    </>
                                ) : (
                                    <>
                                        EXECUTE_CHECKOUT <span className="material-icons text-base">sensors</span>
                                    </>
                                )}
                            </button>
                            <div className="flex justify-center gap-4 opacity-30 text-foreground pb-2 md:pb-0">
                                <span className="text-[10px] md:text-[12px] font-mono uppercase">Stripe_Ready</span>
                                <span className="text-[10px] md:text-[12px] font-mono uppercase">SSL_Enabled</span>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
