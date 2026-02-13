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
            className="group relative aspect-square border-r border-b border-black/20 dark:border-white/20 overflow-hidden bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered && audioPreviewUrl ? 'opacity-40 blur-sm' : 'opacity-100 grayscale contrast-125'}`}>
                <img
                    alt={product.name}
                    className="w-full h-full object-cover"
                    src={product.image || 'https://via.placeholder.com/500'}
                />
            </div>

            {/* Waveform Overlay - Only renders if URL exists */}
            {audioPreviewUrl && (
                <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Render Waveform - Passing isHovered to trigger play/pause */}
                    <WaveformOverlay
                        audioUrl={audioPreviewUrl}
                        isActive={isHovered}
                    // You can pass a prop for color if you want to override default
                    />
                </div>
            )}

            {/* Info Overlay (Desktop) */}
            <div className={`absolute inset-0 p-6 flex flex-col justify-between z-30 pointer-events-none`}>
                {/* Top Info - Always visible but styled differently on hover?? 
                   Actually keeping it clean: Show info on hover or always? 
                   Let's follow previous design: Info appears/changes on hover. 
               */}

                {/* Glitch Title - Hidden on Hover to show Waveform clearly? Or overlaying it? */}
                <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <h3 className="font-gothic text-3xl leading-none text-white drop-shadow-[0_0_10px_rgba(192,255,0,0.8)]">
                        {product.name}
                    </h3>
                    <p className="font-mono text-xs text-primary mt-1">
                        {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                    </p>
                </div>

                {/* Action Button - Only visible on Hover */}
                <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} pointer-events-auto`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        disabled={isInCart}
                        className="bg-primary text-black hover:bg-white transition-colors px-4 py-2 text-xs font-bold uppercase w-full font-mono border-2 border-black active:translate-y-[1px]"
                    >
                        {isInCart ? 'IN CART' : 'ADD TO CART'}
                    </button>
                </div>
            </div>

            {/* Default Static Title (Desktop Only) - Fades out on hover */}
            <div className={`hidden md:block absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="font-gothic text-4xl leading-none text-white drop-shadow-lg mix-blend-difference">
                    {product.name}
                </h3>
            </div>

            {/* Mobile View - Simplified (No hover logic needed per se, but good fallback) */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                <h3 className="font-gothic text-2xl leading-none text-white mb-2">{product.name}</h3>
                <button
                    onClick={() => onAddToCart(product)}
                    className="bg-primary text-black px-4 py-2 text-xs w-full uppercase font-bold"
                >
                    {isInCart ? 'ADDED' : `ADD $${product.amount}`}
                </button>
            </div>
        </div>
    );
}
