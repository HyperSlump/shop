'use client';

import { useState } from 'react';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';
import Image from 'next/image';

interface ProductCardProps {
    product: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isInCart: boolean;
    onAddToCart: (product: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
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
            className="group relative border border-black/20 dark:border-white/20 bg-black overflow-hidden h-96 cursor-default transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                // Toggle hover state on mobile click
                if (window.matchMedia('(max-width: 768px)').matches) {
                    setIsHovered(!isHovered);
                }
            }}
        >
            {/* DEFAULT VIEW: Image + Title Overlay */}
            <div className="absolute inset-0">
                <Image
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-40 group-hover:blur-sm grayscale contrast-125"
                    src={product.image || 'https://via.placeholder.com/500'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Mobile Preview CTA */}
            <div className={`md:hidden absolute top-2 right-2 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-primary animate-pulse">
                    <span className="material-icons text-xl">touch_app</span>
                </div>
            </div>

            {/* Static Title/Price (Always Visible, but moves/fades on hover if we want?) 
                Let's keep it visible but maybe move it up or hide it if we want full transformations.
                The prompt says "original prod card will change into an informative prod card".
                Let's keep the title visible as an anchor.
            */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex justify-between items-end">
                    <h3 className="font-gothic text-3xl text-white mix-blend-difference">{product.name}</h3>
                    <span className="font-mono text-primary text-xs bg-primary/10 px-2 py-1">{product.amount === 0 ? 'FREE' : `$${product.amount}`}</span>
                </div>
            </div>

            {/* HOVER OVERLAY: Informative Details */}
            <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm p-6 flex flex-col justify-between transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Neon Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40 pointer-events-none" />

                {/* Header */}
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-white">{product.name}</h3>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-primary text-xs">{product.amount === 0 ? 'FREE' : `$${product.amount}`}</span>
                            {/* Mobile Close Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsHovered(false);
                                }}
                                className="md:hidden text-white/50 hover:text-white"
                            >
                                <span className="material-icons text-xl">close</span>
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-primary/30" />
                    <p className="font-mono text-[10px] text-gray-300 leading-tight">
                        {product.description || "Raw industrial audio assets."}
                    </p>
                </div>

                {/* Main Waveform */}
                {audioPreviewUrl && isHovered && (
                    <div className="relative w-full h-16 bg-black/50 border border-white/10 rounded overflow-hidden shrink-0 group/wave">
                        {/* Technical accents for waveform */}
                        <div className="absolute top-0 left-0 w-2 h-[1px] bg-primary/60" />
                        <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-primary/60" />

                        <div className="absolute top-1 left-2 text-[8px] text-primary/80 uppercase tracking-widest flex items-center gap-1">
                            <div className="w-1 h-1 bg-primary animate-pulse rounded-full" />
                            Main Preview
                        </div>
                        <WaveformOverlay
                            audioUrl={audioPreviewUrl}
                            isActive={isHovered}
                        />
                    </div>
                )}

                {/* One Shots Grid */}
                {samples.length > 0 && (
                    <div className="space-y-1 relative">
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">One Shots</p>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {samples.map((url, index) => (
                                <OneShotPlayer
                                    key={index}
                                    audioUrl={url}
                                    label={`Shot ${index + 1}`}
                                    isActive={isHovered}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Action */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    disabled={isInCart}
                    className="w-full bg-primary text-black font-bold uppercase py-3 text-xs hover:bg-white transition-all duration-300 relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    <span className="relative z-10">{isInCart ? 'Added to Cart' : 'Add to Cart'}</span>
                </button>
            </div>
        </div>
    );
}
