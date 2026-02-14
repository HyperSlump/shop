'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import NextImage from 'next/image';
import { X, ArrowRight } from 'lucide-react';
import MatrixSpace from './MatrixSpace';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [exitingItems, setExitingItems] = useState<string[]>([]);

    const handleRemoveItem = (id: string) => {
        setExitingItems(prev => [...prev, id]);
        setTimeout(() => {
            removeFromCart(id);
            setExitingItems(prev => prev.filter(item => item !== id));
        }, 500); // Match transition duration
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
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleCart}
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--background)] border-l border-black/10 dark:border-white/10 z-[70] flex flex-col shadow-2xl transition-all duration-500 ease-out ${isCartOpen
                    ? 'opacity-100 translate-y-0 translate-x-0'
                    : 'opacity-0 translate-y-8 translate-x-4 pointer-events-none'
                    }`}
            >
                {/* Matrix Background Texture */}
                <div className="absolute inset-0 z-0 opacity-[0.6] dark:opacity-[0.25] pointer-events-none">
                    <MatrixSpace isVisible={isCartOpen} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]" />
                </div>

                <header className="flex justify-between items-center mb-8 border-b border-black/10 dark:border-white/10 p-6 pb-4 relative z-10">
                    <h2 className="font-gothic text-4xl uppercase tracking-tighter text-foreground">Your Crate ({cart.length})</h2>
                    <button
                        onClick={toggleCart}
                        className="hover:translate-x-1 active:scale-95 transition-all text-primary/70 hover:text-primary px-4 flex items-center gap-2 group"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
                        <ArrowRight size={24} />
                    </button>
                </header>

                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-4 relative z-10">
                        <span className="material-icons text-8xl">shopping_bag</span>
                        <p className="font-mono text-xs tracking-[0.5em]">BUFFER_EMPTY</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 px-6 custom-scrollbar relative z-10">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className={`flex h-32 border border-foreground/10 bg-black/5 dark:bg-white/5 transition-all duration-300 relative group shrink-0 ${exitingItems.includes(item.id) ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'
                                    }`}
                            >
                                {/* Item Decoration Layer */}
                                <div className="absolute inset-0 z-50 pointer-events-none border border-foreground/5 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/40 transition-all group-hover:w-4 group-hover:h-4" />
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/40 transition-all group-hover:w-4 group-hover:h-4" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/40 transition-all group-hover:w-4 group-hover:h-4" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/40 transition-all group-hover:w-4 group-hover:h-4" />

                                    {/* Tiny Screws */}
                                    <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-primary/30 rounded-full" />
                                    <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-primary/30 rounded-full" />
                                    <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-primary/30 rounded-full" />
                                    <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-primary/30 rounded-full" />

                                    {/* Unit Ref */}
                                    <div className="absolute top-0 right-4 px-1.5 bg-[var(--background)] border-x border-foreground/5 h-2.5 flex items-center">
                                        <span className="font-mono text-[8px] text-foreground/20 font-bold tracking-widest leading-none">ID_{item.id.slice(0, 4)}</span>
                                    </div>
                                </div>
                                {/* Left Column: Static Thumbnail */}
                                <div className="w-1/3 relative border-r border-primary/10 flex items-center justify-center bg-[var(--background)] p-2">
                                    <div className="relative w-full aspect-square overflow-hidden">
                                        <NextImage
                                            src={item.image || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            fill
                                            className="object-cover opacity-80 contrast-125 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                        />
                                    </div>
                                    {/* Detailed Specimen Brackets (Thumbnail) */}
                                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-red-500/60 z-30" />
                                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-red-500/60 z-30" />
                                </div>

                                {/* Right Column: Info & Action */}
                                <div className="flex-1 flex flex-col bg-[var(--background)]/90 backdrop-blur-sm">
                                    {/* Info Header */}
                                    <div className="p-3 pb-2 flex-col gap-0.5">
                                        <h3 className="font-gothic text-lg leading-none tracking-tight text-foreground truncate">{item.name}</h3>
                                        <div className="flex items-center gap-1.5 opacity-40">
                                            <div className="w-[3px] h-[3px] bg-primary rounded-full" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest leading-tight whitespace-nowrap">
                                                ID: {item.id.slice(0, 8)} // V.1
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    {/* Action Footer */}
                                    <div className="mt-auto p-3 pt-2 border-t border-primary/10 flex justify-between items-center bg-black/[0.02]">
                                        <span className="font-mono text-xs font-bold text-primary">
                                            {item.amount === 0 ? 'FREE' : `$${item.amount.toFixed(2)}`}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="font-mono text-[11px] text-foreground/30 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1 group/del"
                                        >
                                            <span className="w-1.5 h-1.5 border border-current group-hover/del:bg-red-500 transition-all" />
                                            [ REMOVE ]
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 border-t border-black/20 dark:border-white/20 p-6 pt-6 space-y-4">
                    <div className="flex justify-between font-mono text-xl font-bold tracking-tighter text-foreground">
                        <span className="opacity-60 text-foreground">SUBTOTAL_</span>
                        <span className="text-primary">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full bg-primary text-primary-foreground font-bold uppercase py-5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm tracking-widest"
                    >
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
                    <div className="flex justify-center gap-4 opacity-30 text-foreground">
                        <span className="text-[10px] font-mono uppercase">Stripe_Ready</span>
                        <span className="text-[10px] font-mono uppercase">SSL_Enabled</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
