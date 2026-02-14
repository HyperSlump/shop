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
            {/* DEFAULT VIEW: Structured Technical Layout */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Top Section: Image Display */}
                <div className="flex-1 relative bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden p-6">
                    {/* Background Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.1] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    {/* Centered Image with specialized frame */}
                    <div className="relative w-40 h-40 md:w-56 md:h-56 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        <div className="absolute inset-0 border border-primary/20 bg-primary/5 z-0 transform rotate-3" />
                        <div className="absolute inset-0 border border-primary/20 bg-primary/5 z-0 transform -rotate-3" />
                        <div className="relative z-10 w-full h-full border border-primary/30 bg-black">
                            <Image
                                alt={product.name}
                                className="w-full h-full object-cover opacity-90 contrast-125"
                                src={product.image || 'https://via.placeholder.com/500'}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Info */}
                <div className="h-auto border-t border-primary/20 bg-[var(--background)] p-5 relative">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-gothic text-3xl text-foreground leading-none tracking-wide">
                            {product.name}
                        </h3>
                        <span className="font-mono text-primary font-bold border border-primary/30 px-2 py-1 text-xs">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <p className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold">
                            ELECTRONIC MUSIC SAMPLE PACK
                        </p>
                    </div>

                    {/* Decorative barcode/tech lines */}
                    <div className="w-full h-4 flex gap-1 opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="flex-1 bg-foreground" style={{ opacity: Math.random() }} />
                        ))}
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
                    className="w-full py-4 relative group/btn cursor-pointer overflow-hidden border border-primary bg-primary hover:bg-transparent transition-all duration-300"
                >
                    <span className="relative z-10 font-mono font-bold uppercase tracking-[0.2em] text-xs text-black dark:text-black group-hover/btn:text-primary dark:group-hover/btn:text-primary transition-colors duration-300 flex items-center justify-center gap-2">
                        {isInCart ? '[ ADDED ]' : '[ ADD TO CART ]'}
                    </span>
                </button>
            </div>
        </div>
    );
}
