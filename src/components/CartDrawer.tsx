'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import NextImage from 'next/image';
import { X } from 'lucide-react';

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
                {/* Scanline Background Texture */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-5 pointer-events-none z-0"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 4px)'
                    }}
                />

                <header className="flex justify-between items-center mb-8 border-b border-black/10 dark:border-white/10 p-6 pb-4 relative z-10">
                    <h2 className="font-gothic text-4xl uppercase tracking-tighter text-primary">Your Crate ({cart.length})</h2>
                    <button
                        onClick={toggleCart}
                        className="hover:rotate-90 transition-all duration-300 text-foreground hover:text-primary px-4 flex items-center gap-2 group"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                        <X size={24} />
                    </button>
                </header>

                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-4">
                        <span className="material-icons text-8xl">shopping_bag</span>
                        <p className="font-mono text-xs tracking-[0.5em]">BUFFER_EMPTY</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 px-6 custom-scrollbar">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className={`flex gap-4 p-4 border border-primary/40 hover:border-primary hover:bg-primary/5 transition-all duration-500 relative group bg-transparent ${exitingItems.includes(item.id) ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'
                                    }`}
                            >
                                <div className="relative w-24 h-24 shrink-0 overflow-hidden border border-primary/20 bg-black/20">
                                    <NextImage
                                        src={item.image || 'https://via.placeholder.com/100'}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-gothic text-xl leading-none tracking-tight text-foreground">{item.name}</h3>
                                        <p className="text-[9px] font-mono text-foreground/50 uppercase tracking-widest">
                                            {item.metadata?.key && `KEY_${item.metadata.key} // `}
                                            PTR_{item.id.slice(-6)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <p className="font-mono font-bold text-primary">
                                            {item.amount === 0 ? 'FREE' : `$${item.amount.toFixed(2)}`}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-[9px] font-bold text-red-500/60 hover:text-red-500 underline uppercase tracking-widest transition-colors"
                                        >
                                            [Delete]
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
