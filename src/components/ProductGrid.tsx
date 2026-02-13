'use client';

import { useCart, Product } from './CartProvider';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
    const { addToCart, cart } = useCart();

    const isInCart = (id: string) => cart.some(item => item.id === id);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto transition-all duration-300 ease-in-out">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    isInCart={isInCart(product.id)}
                    onAddToCart={handleAddToCart}
                />
            ))}

        </div>
    );
}
