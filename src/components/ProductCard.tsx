'use client';

import { useState } from 'react';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';

interface ProductCardProps {
    product: any;
    isInCart: boolean;
    onAddToCart: (product: any) => void;
}

export default function ProductCard({ product, isInCart, onAddToCart }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Check for the audio preview URL in metadata
    const audioPreviewUrl = product.metadata?.audio_preview;

    // Get one-shot samples
    const samples = [
        product.metadata?.sample_1,
        product.metadata?.sample_2,
        product.metadata?.sample_3,
        product.metadata?.sample_4,
    ].filter(Boolean); // Only keep existing URLs

    return (
        <div
            className="group relative border border-black/20 dark:border-white/20 bg-black flex flex-col md:grid md:grid-cols-2 overflow-hidden h-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* LEFT COLUMN: Image & Main Waveform */}
            <div className="relative aspect-square w-full h-full border-b md:border-b-0 md:border-r border-white/10">
                {/* Background Image */}
                <div className={`absolute inset-0 transition-all duration-500 ${isHovered && audioPreviewUrl ? 'opacity-80 blur-[2px]' : 'opacity-100 grayscale contrast-125'}`}>
                    <img
                        alt={product.name}
                        className="w-full h-full object-cover"
                        src={product.image || 'https://via.placeholder.com/500'}
                    />
                </div>

                {/* Waveform Overlay - Only renders if URL exists */}
                {audioPreviewUrl && (
                    <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <WaveformOverlay
                                audioUrl={audioPreviewUrl}
                                isActive={isHovered}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Title Overlay (Hidden on Desktop) */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent md:hidden pointer-events-none">
                    <h3 className="font-gothic text-xl text-white">{product.name}</h3>
                </div>
            </div>

            {/* RIGHT COLUMN: Details & Controls */}
            <div className="flex flex-col p-4 h-full relative justify-between gap-4">

                {/* Header */}
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="hidden md:block font-gothic text-2xl leading-none text-white drop-shadow-md mix-blend-difference">
                            {product.name}
                        </h3>
                        <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="w-full">
                        <p className="font-mono text-[10px] text-gray-300 leading-tight line-clamp-4">
                            {product.description || "Heavy low-end frequencies, distorted textures, and industrial percussion. Raw audio for the underground."}
                        </p>
                    </div>
                </div>

                {/* Samples Grid (One-Shots) */}
                {samples.length > 0 && (
                    <div className="w-full">
                        <p className="font-mono text-[9px] text-gray-500 mb-1 uppercase tracking-wider">Samples</p>
                        <div className="grid grid-cols-2 gap-2">
                            {samples.map((url, index) => (
                                <OneShotPlayer
                                    key={index}
                                    audioUrl={url}
                                    label={`One Shot ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Action */}
                <div className="mt-auto pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        disabled={isInCart}
                        className="bg-primary text-black hover:bg-white transition-all px-4 py-3 text-xs font-bold uppercase w-full font-mono border border-black active:translate-y-[1px]"
                    >
                        {isInCart ? 'IN CART' : 'ADD TO CART'}
                    </button>
                </div>
            </div>
        </div>
    );
}
