'use client';

import { useCart } from './CartProvider';
import { useState } from 'react';
import NextImage from 'next/image';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);

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

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <aside className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-background-light dark:bg-background-dark border-l border-black/20 dark:border-white/20 z-[70] flex flex-col p-6 shadow-2xl transition-transform transform translate-x-0">
                <header className="flex justify-between items-center mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="font-display text-4xl uppercase">Cart ({cart.length})</h2>
                    <button
                        onClick={toggleCart}
                        className="hover:scale-110 active:scale-95 transition-transform"
                    >
                        <span className="material-icons text-3xl">close</span>
                    </button>
                </header>

                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-4">
                        <span className="material-icons text-6xl">shopping_bag</span>
                        <p className="font-mono text-sm">YOUR CRATE IS EMPTY</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 p-4 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative group"
                            >
                                <NextImage
                                    src={item.image || 'https://via.placeholder.com/100'}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="object-cover grayscale contrast-125"
                                />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-gothic text-xl leading-none">{item.name}</h3>
                                        <p className="text-[10px] font-mono opacity-60 uppercase mt-1">
                                            {item.metadata?.key && `KEY: ${item.metadata.key} // `}
                                            ID: {item.id.slice(0, 8)}...
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="font-mono font-bold">
                                            {item.amount === 0 ? 'FREE' : `$${item.amount.toFixed(2)}`}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[10px] underline hover:text-primary uppercase"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 border-t border-black/20 dark:border-white/20 pt-6 space-y-4">
                    <div className="flex justify-between font-mono text-xl font-bold">
                        <span>TOTAL</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full bg-primary text-black font-bold uppercase py-4 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-icons animate-spin text-sm">refresh</span>
                                PROCESSING...
                            </>
                        ) : (
                            <>
                                SECURE CHECKOUT <span className="material-icons text-sm">arrow_forward</span>
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center opacity-40 uppercase">
                        Encrypted payment processing via Stripe
                    </p>
                </div>
            </aside>
        </>
    );
}
