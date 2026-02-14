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
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--background)] border-l-2 border-foreground/10 z-[70] flex flex-col shadow-2xl transition-all duration-500 ease-out ${isCartOpen
                    ? 'opacity-100 translate-y-0 translate-x-0'
                    : 'opacity-0 translate-y-8 translate-x-4 pointer-events-none'
                    }`}
            >
                {/* Matrix Background Texture */}
                <div className="absolute inset-0 z-0 opacity-[0.9] dark:opacity-[0.6] pointer-events-none">
                    <MatrixSpace isVisible={isCartOpen} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/60 to-[var(--background)]" />
                </div>

                <header className="flex justify-between items-center mb-0 border-b-2 border-foreground/10 p-6 pb-6 relative z-10">
                    <div className="flex flex-col">
                        <div className="text-sm uppercase font-bold tracking-[0.2em] text-primary">
                            Current Cart
                        </div>
                        <div className="text-4xl font-gothic leading-none text-foreground mt-1">
                            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                        </div>
                    </div>
                    <button
                        onClick={toggleCart}
                        className="hover:translate-x-1 active:scale-95 transition-all text-primary/70 hover:text-primary px-4 flex items-center gap-2 group"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
                        <ArrowRight size={24} />
                    </button>
                </header>

                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 relative z-10">
                        <span className="material-icons text-9xl">shopping_cart</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 px-6 custom-scrollbar relative z-10">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className={`flex h-24 border-b-2 border-foreground/10 items-center transition-all duration-300 relative group shrink-0 ${exitingItems.includes(item.id) ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'
                                    }`}
                            >
                                {/* Left Column: Static Thumbnail */}
                                <div className="w-16 h-16 relative flex items-center justify-center bg-[var(--background)] p-0">
                                    <div className="relative w-full h-full overflow-hidden">
                                        <NextImage
                                            src={item.image || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            fill
                                            className="object-cover opacity-80 contrast-125 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Info & Action */}
                                <div className="flex-1 flex flex-col pl-4">
                                    {/* Info Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <h3 className="font-gothic text-lg leading-none tracking-tight text-foreground truncate">{item.name}</h3>
                                            <span className="font-mono text-[9px] uppercase tracking-widest leading-tight opacity-40 mt-1">
                                                ID: {item.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-primary">
                                            {item.amount === 0 ? 'FREE' : `$${item.amount.toFixed(2)}`}
                                        </span>
                                    </div>

                                    <div className="flex-1" />

                                    {/* Action Footer */}
                                    <div className="flex justify-start items-center pb-1">
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="font-mono text-[9px] text-foreground/40 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group/del"
                                        >
                                            <span className="w-1 h-1 bg-foreground/20 group-hover/del:bg-red-500 transition-all" />
                                            [ REMOVE ]
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 border-t-2 border-foreground/10 p-6 pt-6 space-y-4">
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
