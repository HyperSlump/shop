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
            className="group relative border border-[var(--border)] bg-[var(--background)] overflow-hidden h-96 cursor-default transition-all duration-300 shadow-sm dark:shadow-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                // Toggle hover state on mobile click
                if (window.matchMedia('(max-width: 768px)').matches) {
                    setIsHovered(!isHovered);
                }
            }}
        >
            {/* DEFAULT VIEW: Image + Artistic Overlays */}
            <div className="absolute inset-0">
                <Image
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-40 group-hover:blur-sm"
                    src={product.image || 'https://via.placeholder.com/500'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay - Creates depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Scanline Effect */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 4px)'
                    }}
                />
            </div>

            {/* Corner Brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Vertical Technical Accent */}
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <div className="vertical-text font-mono text-[8px] tracking-[0.3em] text-primary/40 uppercase">
                    AUDIO_ASSET
                </div>
            </div>

            {/* Mobile Preview CTA */}
            <div className={`md:hidden absolute top-2 right-2 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-primary animate-pulse">
                    <span className="material-icons text-xl">touch_app</span>
                </div>
            </div>

            {/* Enhanced Title/Price Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 z-20 ${isHovered ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {/* Glitch bar accent */}
                <div className="absolute top-0 left-0 w-16 h-[2px] bg-primary mb-3" />

                <div className="flex justify-between items-end gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-gothic text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
                            {product.name}
                        </h3>
                        <p className="font-mono text-[9px] text-primary/80 uppercase tracking-widest mt-1">
                            Digital Asset
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                        <span className="relative font-mono text-primary text-sm font-bold bg-black/60 backdrop-blur-sm px-3 py-2 border border-primary/30">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* HOVER OVERLAY: Informative Details */}
            <div className={`absolute inset-0 bg-[var(--background)] backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-300 z-30 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Internal Noise for Hover State */}
                <div
                    className="absolute inset-0 noise pointer-events-none opacity-[var(--noise-opacity)]"
                    style={{ mixBlendMode: 'var(--noise-blend)' as any }}
                />
                {/* Neon Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40 pointer-events-none" />

                {/* Header */}
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-foreground">{product.name}</h3>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-primary text-xs">{product.amount === 0 ? 'FREE' : `$${product.amount}`}</span>
                            {/* Mobile Close Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsHovered(false);
                                }}
                                className="md:hidden text-foreground/50 hover:text-foreground"
                            >
                                <span className="material-icons text-xl">close</span>
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-primary/30" />
                    <p className="font-mono text-[10px] text-foreground/70 leading-tight">
                        {product.description || "Raw industrial audio assets."}
                    </p>
                </div>

                {/* Main Waveform */}
                {audioPreviewUrl && isHovered && (
                    <div className="relative w-full h-16 bg-[var(--background)] border border-black/10 dark:border-white/10 rounded overflow-hidden shrink-0 group/wave">
                        {/* Technical accents for waveform */}
                        <div className="absolute top-0 left-0 w-2 h-[1px] bg-black/20 dark:bg-primary/60" />
                        <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-black/20 dark:bg-primary/60" />

                        <div className="absolute top-1 left-2 text-[8px] text-foreground/50 dark:text-primary/80 uppercase tracking-widest flex items-center gap-1">
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
                {isHovered && samples.length > 0 && (
                    <div className="space-y-1 relative">
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-[9px] text-gray-500/50 dark:text-gray-400/50 uppercase tracking-widest">One Shots</p>
                            <div className="flex-1 h-[1px] bg-black/5 dark:bg-white/5" />
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
                    className="w-full font-bold uppercase py-3 text-xs flex items-center justify-center transition-colors duration-200 border bg-primary text-primary-foreground border-transparent hover:bg-[#f5f3ed] hover:text-primary hover:border-primary dark:bg-primary dark:text-primary-foreground dark:border-transparent dark:hover:bg-[#080808] dark:hover:text-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
