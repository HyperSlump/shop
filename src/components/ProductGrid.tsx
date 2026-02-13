'use client';

import { useCart, Product } from './CartProvider';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: any[] }) {
    const { addToCart, cart } = useCart();

    const isInCart = (id: string) => cart.some(item => item.id === id);

    const handleAddToCart = (product: any) => {
        // Cast to Product type for safety
        addToCart(product as Product);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-0 bg-background-light dark:bg-background-dark border-l md:border-l-0 border-black/20 dark:border-white/20">
            {products.map((product, i) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    isInCart={isInCart(product.id)}
                    onAddToCart={handleAddToCart}
                />
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
