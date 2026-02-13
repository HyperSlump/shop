'use client';

import { useState } from 'react';
import WaveformOverlay from './WaveformOverlay';

interface ProductCardProps {
    product: any;
    isInCart: boolean;
    onAddToCart: (product: any) => void;
}

export default function ProductCard({ product, isInCart, onAddToCart }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Check for the audio preview URL in metadata
    const audioPreviewUrl = product.metadata?.audio_preview;

    return (
        <div
            className="group relative aspect-square border-r border-b border-black/20 dark:border-white/20 overflow-hidden bg-black flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image - Remains visible but darkened on hover */}
            <div className={`absolute inset-0 transition-all duration-500 ${isHovered && audioPreviewUrl ? 'opacity-30 blur-sm' : 'opacity-100 grayscale contrast-125'}`}>
                <img
                    alt={product.name}
                    className="w-full h-full object-cover"
                    src={product.image || 'https://via.placeholder.com/500'}
                />
            </div>

            {/* Content Container - Flex layout to push content to edges */}
            <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between pointer-events-none">

                {/* Header: Title & Price */}
                <div className={`transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-0'}`}>
                    <h3 className="font-gothic text-2xl leading-none text-white drop-shadow-md mix-blend-difference">
                        {product.name}
                    </h3>
                    <p className="font-mono text-[10px] text-primary mt-1">
                        {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                    </p>
                </div>

                {/* Description - Revealed/Highlighted on Hover */}
                <div className={`mt-2 flex-grow transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
                    <p className="font-mono text-[10px] text-gray-300 leading-tight">
                        {product.description || "Heavy low-end frequencies, distorted textures, and industrial percussion. Raw audio for the underground."}
                    </p>
                </div>

                {/* Bottom Section: Waveform & Action */}
                <div className="mt-auto pointer-events-auto">
                    {/* Waveform Player */}
                    {audioPreviewUrl && (
                        <div className={`h-[60px] w-full relative mb-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute inset-0 -mx-4"> {/* Negative margin to span full width if desired, or keep contained */}
                                <WaveformOverlay
                                    audioUrl={audioPreviewUrl}
                                    isActive={isHovered}
                                />
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        disabled={isInCart}
                        className={`bg-primary text-black hover:bg-white transition-all px-4 py-2 text-[10px] font-bold uppercase w-full font-mono border border-black active:translate-y-[1px] ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        {isInCart ? 'IN CART' : 'ADD TO CART'}
                    </button>
                </div>
            </div>

            {/* Static Footer Title (optional, if we want a clean look when not hovering) 
                 Actually, keeping the top title always visible is better for "Small Product Card" feel.
             */}
        </div>
    );
}
