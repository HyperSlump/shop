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
    const [showPreview, setShowPreview] = useState(false);

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
        >
            {/* DEFAULT VIEW: Image + Artistic Overlays */}
            {/* DEFAULT VIEW: Structured Technical Layout */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${showPreview ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                {/* Top Section: Split Layout (Image Left / Tech Right) */}
                <div className="flex-1 flex relative border-b border-primary/20 bg-black/5 dark:bg-white/5 transition-colors duration-500">

                    {/* Left Column: Image */}
                    <div className="w-1/2 relative p-4 flex items-center justify-center border-r border-primary/10">
                        {/* Centered Image with specialized frame */}
                        <div className="relative w-full aspect-square shadow-xl transition-transform duration-500 group-hover:scale-105">
                            {/* Frame Borders */}
                            <div className="absolute inset-0 border border-primary/30 z-20 pointer-events-none" />
                            {/* Corner Accents */}
                            <div className="absolute -top-[1px] -left-[1px] w-1 h-1 bg-red-500 z-30" />
                            <div className="absolute -top-[1px] -right-[1px] w-1 h-1 bg-primary z-30" />
                            <div className="absolute -bottom-[1px] -left-[1px] w-1 h-1 bg-primary z-30" />
                            <div className="absolute -bottom-[1px] -right-[1px] w-1 h-1 bg-red-500 z-30" />

                            <div className="relative w-full h-full overflow-hidden bg-transparent">
                                <Image
                                    alt={product.name}
                                    className="w-full h-full object-cover opacity-80 contrast-125 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                    src={product.image || 'https://via.placeholder.com/500'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tech Specs & CTA */}
                    <div className="w-1/2 relative flex flex-col p-4 overflow-hidden">
                        {/* Digital Line Noise Background */}
                        <div
                            className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 4px)'
                            }}
                        />

                        {/* Top: Tech Label */}
                        <div className="relative z-10 mb-2 font-mono text-[8px] uppercase tracking-widest leading-tight">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-1 h-1 bg-red-500 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
                                <span className="text-red-500/90 font-bold">rec_asset</span>
                            </div>
                            <p className="text-primary/60">
                                // ID: {product.id.slice(0, 6)}...
                            </p>
                        </div>

                        {/* Description */}
                        <div className="relative z-10 flex-1 overflow-hidden">
                            <p className="font-mono text-[9px] text-foreground/70 leading-relaxed line-clamp-4">
                                {product.description || "Raw industrial audio assets. Contains high-fidelity stems and synthesis textures for production."}
                            </p>
                        </div>

                        {/* Bottom: Preview Button */}
                        <div className="relative z-10 pt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPreview(true);
                                }}
                                className="w-full py-2 border border-primary/30 bg-transparent hover:bg-transparent text-primary/70 hover:text-primary transition-all duration-200 group/play flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-sm group-hover/play:scale-110 transition-transform">play_circle</span>
                                <span className="font-mono text-[8px] uppercase tracking-[0.2em] font-bold">PREVIEW</span>
                            </button>
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

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <p className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold">
                            ELECTRONIC MUSIC SAMPLE PACK
                        </p>
                    </div>
                </div>
            </div>

            {/* PREVIEW OVERLAY: Informative Details + Player */}
            <div className={`absolute inset-0 bg-[var(--background)] backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-300 z-30 ${showPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
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
                            {/* Close Button - Always visible now */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPreview(false);
                                }}
                                className="text-foreground/50 hover:text-foreground transition-colors"
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
                {audioPreviewUrl && showPreview && (
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
                            isActive={showPreview}
                        />
                    </div>
                )}

                {/* One Shots Grid */}
                {showPreview && samples.length > 0 && (
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
                                    isActive={showPreview}
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
