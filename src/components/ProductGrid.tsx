'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function ProductGrid({ products }: { products: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleBuy = async (priceId: string) => {
        setLoadingId(priceId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
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
            setLoadingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-0 bg-background-light dark:bg-background-dark">
            {products.map((product, i) => (
                <div
                    key={product.id}
                    className="group relative aspect-square border-r border-b border-black/20 dark:border-white/20 overflow-hidden glitch-hover"
                >
                    {/* Main Image */}
                    <img
                        alt={product.name}
                        className="glitch-img w-full h-full object-cover grayscale contrast-125 transition-all duration-300"
                        src={product.image || 'https://via.placeholder.com/500'}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-between text-white">
                        <div className="space-y-1 text-xs font-mono">
                            <p>PRICE: {product.amount === 0 ? 'FREE' : `$${product.amount}`}</p>
                            <p>KEY: {product.metadata?.key || 'UNKNOWN'}</p>
                            <p>FILES: {product.metadata?.files || 'N/A'}</p>
                        </div>

                        <button
                            onClick={() => handleBuy(product.id)}
                            disabled={loadingId === product.id}
                            className="bg-primary text-black px-4 py-2 text-xs font-bold uppercase w-full hover:scale-105 active:scale-95 transition-transform"
                        >
                            {loadingId === product.id ? 'PROCESSING...' : (product.amount === 0 ? 'DOWNLOAD NOW' : 'ADD TO RACK')}
                        </button>
                    </div>

                    {/* Default Title Label */}
                    <div className="absolute bottom-4 left-4 right-4 group-hover:hidden transition-all">
                        <h3 className="font-gothic text-4xl leading-none text-white drop-shadow-lg">{product.name}</h3>
                    </div>
                </div>
            ))}

            {/* Empty Slots Filler for Layout (Optional, based on original design having 8 slots) */}
            {Array.from({ length: Math.max(0, 8 - products.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="hidden lg:block border-r border-b border-black/10 dark:border-white/10 opacity-20 relative aspect-square">
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px]">
                        [EMPTY_SLOT]
                    </div>
                </div>
            ))}
        </div>
    );
}
