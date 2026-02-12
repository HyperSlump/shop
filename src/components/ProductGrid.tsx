'use client';

import { useCart, Product } from './CartProvider';

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

                    {/* Hover Overlay - Desktop: Hover, Mobile: Always visible but partial */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-between text-white hidden md:flex">
                        <div className="space-y-1 text-xs font-mono">
                            <p>PRICE: {product.amount === 0 ? 'FREE' : `$${product.amount}`}</p>
                        </div>

                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isInCart(product.id)}
                            className="bg-primary text-black px-4 py-2 text-xs font-bold uppercase w-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isInCart(product.id) ? 'IN CART' : 'ADD TO CART'}
                        </button>
                    </div>

                    {/* Mobile Only Overlay */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 bg-black/80 p-4 transition-all">
                        <h3 className="font-gothic text-2xl leading-none text-white mb-2">{product.name}</h3>
                        <div className="flex justify-between items-center mb-3 text-[10px] text-white/80 font-mono">
                            <p>PRICE: {product.amount === 0 ? 'FREE' : `$${product.amount}`}</p>
                        </div>
                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isInCart(product.id)}
                            className="bg-primary text-black px-4 py-3 text-xs font-bold uppercase w-full active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isInCart(product.id) ? 'IN CART' : 'ADD'}
                        </button>
                    </div>

                    {/* Default Title Label (Desktop Only) */}
                    <div className="hidden md:block absolute bottom-4 left-4 right-4 group-hover:hidden transition-all">
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
