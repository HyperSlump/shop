'use client';

import { useCart, Product } from './CartProvider';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
    const { addToCart, cart } = useCart();

    const isInCart = (id: string) => cart.some(item => item.id === id);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 w-full p-0 border-t border-l border-primary/20 mt-4 animate-fade-in transition-all duration-500">
            {products.map((product, index) => (
                <div
                    key={product.id}
                    className="w-full animate-fade-in border-r border-b border-primary/20"
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
    );
}
