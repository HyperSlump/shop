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
        <div className="grid grid-cols-1 hover:grid-cols-2 gap-8 max-w-7xl mx-auto transition-all duration-300 ease-in-out">
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
