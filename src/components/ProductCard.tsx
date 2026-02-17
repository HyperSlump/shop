'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';
import MatrixSpace from './MatrixSpace';

interface ProductCardProps {
    product: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    isInCart: boolean;
    onAddToCart: (product: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ProductCard({ product, isInCart, onAddToCart }: ProductCardProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Swipe tracking
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-150, 0], [0.3, 1]);

    // Check for the audio preview URL in metadata
    const audioPreviewUrl = product.metadata?.audio_preview;

    // Get one-shot samples
    const samples = [
        product.metadata?.sample_1,
        product.metadata?.sample_2,
        product.metadata?.sample_3,
        product.metadata?.sample_4,
    ].filter(Boolean); // Only keep existing URLs

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 80;
        if (!showPreview && info.offset.x < -threshold) {
            setShowPreview(true);
        } else if (showPreview && info.offset.x > threshold) {
            setShowPreview(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className="group relative bg-[var(--background)] overflow-hidden h-[440px] md:h-[480px] cursor-pointer shadow-sm dark:shadow-none touch-pan-y"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Side Status Bar */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-primary/20 z-20">
                <div className="absolute top-0 left-0 w-[3px] h-8 bg-primary/60 -translate-x-[1px]" />
            </div>

            {/* Top Right Accent Tab */}
            <div className="absolute top-0 right-12 w-1 h-4 bg-accent/40 z-20" />

            {/* Inner Inset Panel Border */}
            <div className="absolute inset-[3px] border border-primary/5 pointer-events-none z-0" />

            <AnimatePresence mode="wait">
                {!showPreview ? (
                    <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{
                            type: "spring", stiffness: 300, damping: 25, mass: 0.8
                        }}
                        className="absolute inset-0 flex flex-col"
                        // Mobile swipe: drag left to reveal preview
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragEnd={handleDragEnd}
                        style={{ x, opacity }}
                    >
                        {/* Top Section: Single Column Technical Dashboard */}
                        <div className="flex-1 flex flex-col relative border-b-2 border-primary/20 transition-colors duration-500 overflow-hidden">
                            {/* Full Background Matrix Effect */}
                            <div className="absolute inset-0 z-0">
                                <MatrixSpace isVisible={isHovered} />
                            </div>

                            <Link
                                href={`/product/${product.id}`}
                                className="relative z-10 flex-1 w-full overflow-hidden p-3 md:p-4 flex flex-col items-center gap-2 custom-scrollbar hover:bg-primary/[0.02] transition-colors duration-300"
                            >
                                {/* Centered Image Frame */}
                                <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0 transition-transform duration-500 group-hover:scale-105">
                                    <div className="relative block w-full h-full overflow-hidden">
                                        <Image
                                            alt={product.name}
                                            className="w-full h-full object-contain opacity-90 contrast-125 grayscale group-hover:grayscale-0 transition-all duration-500"
                                            src={product.image || 'https://via.placeholder.com/500'}
                                            fill
                                            sizes="160px"
                                        />
                                    </div>
                                </div>

                                {/* Technical Metadata Stack */}
                                <div className="w-full space-y-2 px-1">
                                    {/* Status Label */}
                                    <div className="flex items-center justify-between border-b border-primary/10 pb-1.5 text-[9px]">
                                        <div className="flex items-center gap-1.5 font-mono uppercase tracking-widest leading-tight">
                                            <span className="w-1 h-1 bg-alert rounded-sm animate-pulse" />
                                            <span className="text-alert/90 font-bold">system.active</span>
                                        </div>
                                        <span className="font-mono text-primary/40 text-[10px]">ID_{product.id.slice(0, 8)}</span>
                                    </div>

                                    {/* Description - Compact */}
                                    <p className="font-mono text-[11px] md:text-[12px] text-foreground/70 leading-relaxed text-center px-0 md:px-2">
                                        {product.description || "Raw industrial audio assets. Optimized for digital synthesis."}
                                    </p>

                                    {/* Info Grid - Full Width */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1.5 border-t border-primary/10">
                                        <div className="flex justify-between items-center font-mono text-[10px] text-primary/40 uppercase">
                                            <span>fmt</span>
                                            <span className="text-foreground/60">{product.metadata?.format || "WAV"}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-mono text-[10px] text-primary/40 uppercase">
                                            <span>cnt</span>
                                            <span className="text-foreground/60">{product.metadata?.count || "140"}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-mono text-[10px] text-primary/40 uppercase">
                                            <span>size</span>
                                            <span className="text-foreground/60">{product.metadata?.size || "840MB"}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-mono text-[10px] text-primary/40 uppercase">
                                            <span>type</span>
                                            <span className="text-foreground/60">RF_TECH</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Bottom Section: Info - New Industrial Design */}
                        <div className="min-h-[130px] md:min-h-[140px] border-t border-primary/30 bg-[var(--background)] pt-3 md:pt-4 px-3 md:px-4 pb-4 md:pb-6 relative flex flex-col gap-2">
                            {/* Top Notch decorative element */}
                            <div className="absolute -top-[2px] right-8 w-12 h-[2px] bg-accent z-20" />

                            {/* Header Row */}
                            <div className="flex justify-between items-start">
                                <h3 className="font-gothic text-2xl md:text-3xl text-foreground leading-none tracking-wide max-w-[65%] md:max-w-[70%]">
                                    <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
                                        {product.name}
                                    </Link>
                                </h3>
                                <span className="font-mono text-primary font-bold border border-primary/30 px-2 py-0.5 text-[11px]">
                                    {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                                </span>
                            </div>

                            {/* Tech Specs / Decor */}
                            <div className="flex items-center gap-2 opacity-60 mb-1 md:mb-2">
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                <span className="font-mono text-[10px] md:text-[11px] text-primary uppercase whitespace-nowrap">
                                    ID: {product.id.slice(0, 6)} {'//'} V.1.0
                                </span>
                                <div className="h-[1px] flex-1 bg-primary/10" />
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-primary/10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(true);
                                    }}
                                    className="text-left font-mono text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-foreground/50 hover:text-primary transition-colors flex items-center gap-2 group/pbtn"
                                >
                                    <span className="w-3 h-3 border border-current group-hover/pbtn:bg-primary transition-all rounded-[1px]" />
                                    PREVIEW
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product);
                                    }}
                                    disabled={isInCart}
                                    className="text-right font-mono text-[14px] md:text-[16px] font-bold text-primary uppercase hover:text-primary/70 transition-colors disabled:opacity-50 tracking-wider"
                                >
                                    {isInCart ? '[ IN_CART ]' : '[ ACQUIRE ]'}
                                </button>
                            </div>

                            {/* Mobile swipe hint */}
                            <div className="md:hidden flex items-center justify-center gap-2 pt-1">
                                <div className="h-[2px] w-8 bg-primary/15 rounded-full" />
                                <span className="font-mono text-[8px] text-primary/25 uppercase tracking-widest">swipe for preview</span>
                                <div className="h-[2px] w-8 bg-primary/15 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 1.05, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: 20 }}
                        transition={{
                            type: "spring", stiffness: 350, damping: 28, mass: 1
                        }}
                        className="absolute inset-0 bg-[var(--background)] backdrop-blur-md flex flex-col z-30"
                        // Mobile swipe: drag right to go back
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Background Decoration - Matrix Effect */}
                        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none z-0">
                            <MatrixSpace isVisible={showPreview} />
                        </div>

                        {/* Top Section */}
                        <div className="flex-1 flex flex-col relative border-b-2 border-primary/20 overflow-hidden">
                            <div className="flex-1 overflow-hidden p-2 space-y-2">
                                {/* Header with Close */}
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">{'//'} PREVIEW_ANALYSIS</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowPreview(false);
                                        }}
                                        className="text-foreground/30 hover:text-alert transition-colors"
                                    >
                                        <span className="material-icons text-base">close</span>
                                    </button>
                                </div>

                                {/* Main Waveform */}
                                {audioPreviewUrl && showPreview && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-alert rounded-full animate-pulse" />
                                            <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.2em]">MAIN_PREVIEW.WAV</span>
                                        </div>
                                        <div className="relative w-full h-[26px] bg-[var(--background)] border-2 border-primary/60 dark:border-white/30 rounded overflow-hidden group/wave">
                                            <WaveformOverlay
                                                audioUrl={audioPreviewUrl}
                                                isActive={showPreview}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* One-Shots Section */}
                                <div className="space-y-1.5">
                                    <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">{'//'} ONE_SHOT_SAMPLES</span>
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

                        {/* Bottom Section */}
                        <div className="min-h-[130px] md:min-h-[140px] border-t border-primary/30 bg-[var(--background)] pt-3 md:pt-4 px-3 md:px-4 pb-4 md:pb-6 relative flex flex-col gap-2">
                            <div className="absolute -top-[2px] right-8 w-12 h-[2px] bg-accent z-20" />
                            <div className="flex justify-between items-start">
                                <h3 className="font-gothic text-2xl md:text-3xl text-foreground leading-none tracking-wide max-w-[65%] md:max-w-[70%]">
                                    {product.name}
                                </h3>
                                <span className="font-mono text-primary font-bold border border-primary/30 px-2 py-0.5 text-[11px]">
                                    {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 opacity-60 mb-1 md:mb-2">
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                <span className="font-mono text-[10px] md:text-[11px] text-primary uppercase whitespace-nowrap">
                                    ID: {product.id.slice(0, 6)} {'//'} V.1.0
                                </span>
                                <div className="h-[1px] flex-1 bg-primary/10" />
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-primary/10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(false);
                                    }}
                                    className="text-left font-mono text-[12px] md:text-[14px] uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors flex items-center gap-2 group/back"
                                >
                                    <span className="w-3 h-3 border border-current group-hover/back:bg-foreground transition-all rounded-[1px]" />
                                    [ BACK ]
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product);
                                    }}
                                    disabled={isInCart}
                                    className="text-right font-mono text-[14px] md:text-[16px] font-bold text-primary uppercase hover:text-primary/70 transition-colors disabled:opacity-50 tracking-wider"
                                >
                                    {isInCart ? '[ IN CART ]' : '[ ADD TO CART ]'}
                                </button>
                            </div>

                            {/* Mobile swipe hint */}
                            <div className="md:hidden flex items-center justify-center gap-2 pt-1">
                                <div className="h-[2px] w-8 bg-primary/15 rounded-full" />
                                <span className="font-mono text-[8px] text-primary/25 uppercase tracking-widest">swipe to go back</span>
                                <div className="h-[2px] w-8 bg-primary/15 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
