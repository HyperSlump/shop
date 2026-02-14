'use client';

import { useState } from 'react';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';
import Image from 'next/image';
import MatrixSpace from './MatrixSpace';

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
            className="group relative border border-[var(--border)] bg-[var(--background)] overflow-hidden h-[440px] md:h-[480px] cursor-default transition-all duration-300 shadow-sm dark:shadow-none"
        >
            {/* DEFAULT VIEW: Image + Artistic Overlays */}
            {/* DEFAULT VIEW: Structured Technical Layout */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${showPreview ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                {/* Top Section: Split Layout (Image Left / Tech Right) */}
                <div className="flex-1 flex relative border-b border-primary/20 bg-black/5 dark:bg-white/5 transition-colors duration-500">

                    {/* Left Column: Image */}
                    <div className="w-1/2 relative p-2 md:p-4 flex items-center justify-center border-r border-primary/10">
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
                    <div className="w-1/2 relative flex flex-col p-2 md:p-4 overflow-hidden">
                        {/* Digital Line Noise Background */}
                        <div
                            className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 4px)'
                            }}
                        />
                        <MatrixSpace />

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
                        <div className="relative z-10 flex-col gap-3 hidden sm:flex">
                            <p className="font-mono text-[9px] text-foreground/70 leading-relaxed line-clamp-3">
                                {product.description || "Raw industrial audio assets. Contains high-fidelity stems and synthesis textures for production."}
                            </p>

                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-1 gap-1 pt-2 border-t border-primary/10">
                                <div className="flex justify-between items-center font-mono text-[7px] tracking-tighter text-primary/40 uppercase">
                                    <span>format_type</span>
                                    <span className="text-foreground/60">{product.metadata?.format || "24-bit WAV"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[7px] tracking-tighter text-primary/40 uppercase">
                                    <span>file_count</span>
                                    <span className="text-foreground/60">{product.metadata?.count || "142 SAMPLES"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[7px] tracking-tighter text-primary/40 uppercase">
                                    <span>data_size</span>
                                    <span className="text-foreground/60">{product.metadata?.size || "842 MB"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[7px] tracking-tighter text-primary/40 uppercase">
                                    <span>license_key</span>
                                    <span className="text-foreground/60">RF_UNLIMITED</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Description (Shorter) */}
                        <div className="relative z-10 sm:hidden">
                            <p className="font-mono text-[8px] text-foreground/70 leading-tight line-clamp-2">
                                {product.description}
                            </p>
                        </div>

                        {/* Bottom: Preview Button */}

                    </div>
                </div>

                {/* Bottom Section: Info - Sparse but Technical */}
                <div className="h-auto border-t border-[#570e0e]/20 bg-[var(--background)] pt-4 px-4 pb-6 relative flex flex-col gap-2">

                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-foreground leading-none tracking-wide max-w-[70%]">
                            {product.name}
                        </h3>
                        <span className="font-mono text-[#570e0e] dark:text-red-500 font-bold border border-[#570e0e]/30 px-2 py-0.5 text-[10px]">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </span>
                    </div>

                    {/* Tech Specs / Decor */}
                    <div className="flex items-center gap-2 opacity-60 mb-2">
                        <div className="w-1 h-1 bg-[#570e0e] rounded-full animate-pulse" />
                        <span className="font-mono text-[8px] text-[#570e0e] uppercase whitespace-nowrap">
                            ID: {product.id.slice(0, 6)} // V.1.0
                        </span>
                        <div className="h-[1px] flex-1 bg-[#570e0e]/20" />
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#570e0e]/10">
                        {/* Preview (moved from image) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(true);
                            }}
                            className="text-left font-mono text-[11px] uppercase tracking-widest text-[#570e0e]/60 dark:text-red-500/60 hover:text-[#570e0e] dark:hover:text-red-500 transition-colors flex items-center gap-2 group/pbtn"
                        >
                            <span className="w-2 h-2 border border-current group-hover/pbtn:bg-[#570e0e] dark:group-hover/pbtn:bg-red-500 transition-all rounded-[1px]" />
                            PREVIEW
                        </button>

                        {/* Buy Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            disabled={isInCart}
                            className="text-right font-mono text-[12px] text-[#570e0e] dark:text-red-500 uppercase hover:text-[#751b1b] dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                            {isInCart ? '[ IN CART ]' : '[ BUY NOW ]'}
                        </button>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#570e0e]/40" />
                </div>
            </div>

            {/* PREVIEW OVERLAY: Informative Details + Player */}
            <div className={`absolute inset-0 bg-[var(--background)] backdrop-blur-md flex flex-col transition-all duration-300 z-30 ${showPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Background Decoration */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-5 pointer-events-none z-0"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 4px)'
                    }}
                />

                {/* Top Section: Single Column Layout (Waveform + Samples Stacked) */}
                <div className="flex-1 flex flex-col relative border-b border-primary/20 bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* Header with Close */}
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest">// PREVIEW_ANALYSIS</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPreview(false);
                                }}
                                className="text-foreground/30 hover:text-red-500 transition-colors"
                            >
                                <span className="material-icons text-base">close</span>
                            </button>
                        </div>

                        {/* Main Waveform - Now full width and prominent */}
                        {audioPreviewUrl && showPreview && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                    <span className="font-mono text-[8px] text-primary/60 uppercase tracking-[0.2em]">MAIN_PREVIEW.WAV</span>
                                </div>
                                <div className="relative w-full h-24 bg-[var(--background)] border border-primary/30 rounded overflow-hidden group/wave shadow-xl">
                                    <WaveformOverlay
                                        audioUrl={audioPreviewUrl}
                                        isActive={showPreview}
                                    />
                                </div>
                            </div>
                        )}

                        {/* One-Shots Section */}
                        <div className="space-y-2">
                            <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest">// ONE_SHOT_SAMPLES</span>
                            <div className="grid grid-cols-1 gap-1.5">
                                {samples.map((url, index) => (
                                    <OneShotPlayer
                                        key={index}
                                        audioUrl={url}
                                        label={`S_${index + 1}`}
                                        isActive={showPreview}
                                    />
                                ))}
                                {samples.length === 0 && (
                                    <div className="py-8 border border-dashed border-primary/10 text-center">
                                        <span className="font-mono text-[8px] text-primary/30 uppercase">NO_SAMPLES_AVAILABLE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Info - Consistent with Front */}
                <div className="h-auto border-t border-primary/10 bg-[var(--background)] pt-4 px-4 pb-6 relative flex flex-col gap-2">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-foreground leading-none tracking-wide">
                            {product.name}
                        </h3>
                        <span className="font-mono text-primary font-bold border border-primary/30 px-2 py-0.5 text-[10px]">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </span>
                    </div>

                    {/* Meta Data (Brief) */}
                    <div className="flex items-center gap-2 opacity-60">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span className="font-mono text-[8px] text-primary uppercase whitespace-nowrap">
                            PREVIEW_MODE // {product.id.slice(0, 6)}
                        </span>
                        <div className="h-[1px] flex-1 bg-primary/20" />
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-primary/10">
                        {/* Back Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(false);
                            }}
                            className="text-left font-mono text-[11px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors flex items-center gap-2 group/back"
                        >
                            <span className="w-2 h-2 border border-current group-hover/back:bg-foreground transition-all rounded-[1px]" />
                            [ BACK ]
                        </button>

                        {/* Cart Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            disabled={isInCart}
                            className="text-right font-mono text-[12px] text-primary uppercase hover:opacity-70 transition-opacity font-bold"
                        >
                            {isInCart ? '[ IN CART ]' : '[ ADD TO CART ]'}
                        </button>
                    </div>

                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/40" />
                </div>

            </div>
        </div>
    );
}
