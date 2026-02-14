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
            className="group relative border-2 border-foreground/10 bg-[var(--background)] overflow-hidden h-[440px] md:h-[480px] cursor-default transition-all duration-300 shadow-sm dark:shadow-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Side Status Bar */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-primary/20 z-20">
                <div className="absolute top-0 left-0 w-[3px] h-8 bg-primary/60 -translate-x-[1px]" />
            </div>

            {/* Inner Inset Panel Border */}
            <div className="absolute inset-[3px] border border-primary/5 pointer-events-none z-0" />

            {/* DEFAULT VIEW: Structured Technical Layout */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${showPreview ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                {/* Top Section: Single Column Technical Dashboard */}
                <div className="flex-1 flex flex-col relative border-b-2 border-primary/20 bg-black/5 dark:bg-white/5 transition-colors duration-500 overflow-hidden">
                    {/* Full Background Matrix Effect */}
                    <div className="absolute inset-0 z-0">
                        <MatrixSpace isVisible={isHovered} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]" />
                    </div>

                    <div className="relative z-10 flex-1 overflow-hidden p-4 flex flex-col items-center gap-2 custom-scrollbar">
                        {/* Centered Image Frame */}
                        <div className="relative w-36 h-36 shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-105">

                            {/* Technical Label */}
                            <div className="absolute bottom-1 left-1 z-30 font-mono text-[6px] text-white/40 bg-black/40 px-1">
                                IMG_SAMP._{product.id.slice(0, 4)}
                            </div>

                            <div className="relative w-full h-full overflow-hidden">
                                <Image
                                    alt={product.name}
                                    className="w-full h-full object-cover opacity-90 contrast-125 grayscale group-hover:grayscale-0 transition-all duration-500"
                                    src={product.image || 'https://via.placeholder.com/500'}
                                    fill
                                    sizes="160px"
                                />
                                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                            </div>
                        </div>

                        {/* Technical Metadata Stack */}
                        <div className="w-full space-y-2">
                            {/* Status Label */}
                            <div className="flex items-center justify-between border-b border-primary/10 pb-1.5 text-[8px]">
                                <div className="flex items-center gap-1.5 font-mono uppercase tracking-widest leading-tight">
                                    <span className="w-1 h-1 bg-red-500 rounded-sm animate-pulse" />
                                    <span className="text-red-500/90 font-bold">system.active</span>
                                </div>
                                <span className="font-mono text-primary/40">ID_{product.id.slice(0, 8)}</span>
                            </div>

                            {/* Description - Compact */}
                            <p className="font-mono text-[11px] text-foreground/70 leading-relaxed text-center px-2">
                                {product.description || "Raw industrial audio assets. Optimized for digital synthesis."}
                            </p>

                            {/* Info Grid - Full Width */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1.5 border-t border-primary/10">
                                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                                    <span>fmt</span>
                                    <span className="text-foreground/60">{product.metadata?.format || "WAV"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                                    <span>cnt</span>
                                    <span className="text-foreground/60">{product.metadata?.count || "140"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                                    <span>size</span>
                                    <span className="text-foreground/60">{product.metadata?.size || "840MB"}</span>
                                </div>
                                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                                    <span>type</span>
                                    <span className="text-foreground/60">RF_TECH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Info - New Industrial Design */}
                <div className="h-auto border-t-2 border-primary/30 bg-[var(--background)] pt-4 px-4 pb-6 relative flex flex-col gap-2">
                    {/* Top Notch decorative element */}
                    <div className="absolute -top-[2px] right-8 w-12 h-[2px] bg-red-500 z-20" />

                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-foreground leading-none tracking-wide max-w-[70%]">
                            {product.name}
                        </h3>
                        <span className="font-mono text-primary font-bold border border-primary/30 px-2 py-0.5 text-[10px]">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </span>
                    </div>

                    {/* Tech Specs / Decor */}
                    <div className="flex items-center gap-2 opacity-60 mb-2">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        <span className="font-mono text-[10px] text-primary uppercase whitespace-nowrap">
                            ID: {product.id.slice(0, 6)} // V.1.0
                        </span>
                        <div className="h-[1px] flex-1 bg-primary/10" />
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t-2 border-primary/10">
                        {/* Preview (moved from image) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(true);
                            }}
                            className="text-left font-mono text-[11px] uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-2 group/pbtn"
                        >
                            <span className="w-2 h-2 border border-current group-hover/pbtn:bg-primary transition-all rounded-[1px]" />
                            PREVIEW
                        </button>

                        {/* Buy Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            disabled={isInCart}
                            className="text-right font-mono text-[13px] text-primary uppercase hover:text-primary/70 transition-colors disabled:opacity-50"
                        >
                            {isInCart ? '[ IN CART ]' : '[ BUY NOW ]'}
                        </button>
                    </div>

                </div>
            </div>

            {/* PREVIEW OVERLAY: Informative Details + Player */}
            <div className={`absolute inset-0 bg-[var(--background)] backdrop-blur-md flex flex-col transition-all duration-300 z-30 ${showPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Background Decoration - Matrix Effect */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none z-0">
                    <MatrixSpace isVisible={showPreview} />
                </div>

                {/* Top Section: Single Column Layout (Waveform + Samples Stacked) */}
                <div className="flex-1 flex flex-col relative border-b-2 border-primary/20 bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
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
                                <div className="relative w-full h-16 bg-[var(--background)] border border-primary/30 rounded overflow-hidden group/wave shadow-xl">
                                    <WaveformOverlay
                                        audioUrl={audioPreviewUrl}
                                        isActive={showPreview}
                                    />
                                </div>
                            </div>
                        )}

                        {/* One-Shots Section */}
                        <div className="space-y-1.5">
                            <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest">// ONE_SHOT_SAMPLES</span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                {samples.map((url, index) => (
                                    <OneShotPlayer
                                        key={index}
                                        audioUrl={url}
                                        label={`S_${index + 1}`}
                                        isActive={showPreview}
                                    />
                                ))}
                                {samples.length === 0 && (
                                    <div className="col-span-2 py-4 border border-dashed border-primary/10 text-center">
                                        <span className="font-mono text-[8px] text-primary/30 uppercase">NO_SAMPLES_AVAILABLE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Info - Consistent with Front */}
                <div className="h-auto border-t border-primary/10 bg-[var(--background)] pt-3 px-4 pb-4 relative flex flex-col gap-1.5">
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
                    <div className="flex items-center justify-between mt-0.5 pt-2 border-t border-primary/10">
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

                </div>

            </div>
        </div>
    );
}
