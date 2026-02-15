'use client';

import { useState, useEffect } from 'react';
import { useCart, Product } from './CartProvider';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
    const { addToCart, cart } = useCart();
    const [barcodeHover, setBarcodeHover] = useState(false);
    const [barcodeOpacities, setBarcodeOpacities] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
        setBarcodeOpacities(Array(12).fill(1));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (barcodeHover) {
            const interval = setInterval(() => {
                setBarcodeOpacities(Array(12).fill(0).map(() => Math.random() * 0.7 + 0.3));
            }, 50);
            return () => clearInterval(interval);
        } else {
            setBarcodeOpacities(Array(12).fill(1)); // eslint-disable-line react-hooks/set-state-in-effect
        }
    }, [barcodeHover, mounted]);

    const isInCart = (id: string) => cart.some(item => item.id === id);

    return (
        <div className="px-4 md:px-6 lg:px-8 mb-12">
            {/* Catalog Status Bar - Moved & Resized */}
            <div className="w-full flex items-center justify-between px-0 py-2 mt-2 animate-fade-in">
                <div className="flex items-center gap-4">
                    {/* Decorative Barcode - Smaller Height */}
                    <div
                        className="flex gap-[2px] h-6 transition-opacity cursor-crosshair opacity-60 hover:opacity-100"
                        onMouseEnter={() => setBarcodeHover(true)}
                        onMouseLeave={() => setBarcodeHover(false)}
                    >
                        {[1, 2, 1, 1, 3, 1, 2, 1, 4, 1, 2, 1].map((w, i) => (
                            <div
                                key={i}
                                className={`h-full bg-primary transition-all duration-75`}
                                style={{
                                    width: `${w}px`,
                                    opacity: mounted && barcodeHover && barcodeOpacities[i] ? barcodeOpacities[i] : 0.4
                                }}
                            />
                        ))}
                    </div>
                    <div className="h-[1px] w-12 bg-primary/20 hidden md:block" />
                    <span className="font-mono text-[11px] uppercase tracking-widest opacity-60 hidden md:block">Catalog_Index_v5</span>
                </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full p-0 animate-fade-in transition-all duration-500">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="w-full animate-fade-in border border-primary/20 hover:border-primary/40 transition-colors"
                        style={{ animationDelay: `${200 + index * 100}ms` }}
                    >
                        <ProductCard
                            product={product}
                            isInCart={isInCart(product.id)}
                            onAddToCart={(p) => addToCart(p)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
