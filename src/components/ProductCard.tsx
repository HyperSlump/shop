'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import OneShotPlayer from './OneShotPlayer';

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

    // Audio
    const audioPreviewUrl = product.metadata?.audio_preview;
    const samples = [
        product.metadata?.sample_1,
        product.metadata?.sample_2,
        product.metadata?.sample_3,
        product.metadata?.sample_4,
    ].filter(Boolean);

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
            className="group relative bg-[var(--background)] overflow-hidden rounded cursor-pointer touch-pan-y border border-foreground/[0.06] hover:border-foreground/[0.12] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence initial={false} mode="popLayout">
                {!showPreview ? (
                    <motion.div
                        key="default"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="flex flex-col"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.25}
                        onDragEnd={handleDragEnd}
                        style={{ x }}
                    >
                        {/* ─── IMAGE SECTION ─── */}
                        <Link
                            href={`/product/${product.id}`}
                            className="relative block w-full aspect-[4/3] bg-foreground/[0.02] overflow-hidden"
                        >
                            {/* Product Image */}
                            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-5">
                                <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                                    <Image
                                        alt={product.name}
                                        className="object-contain drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-2xl"
                                        src={product.image || 'https://via.placeholder.com/500'}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                            </div>

                            {/* Subtle format badge */}
                            <div className="absolute top-2 left-2 font-mono text-[8px] uppercase tracking-wider text-foreground/30 bg-[var(--background)]/80 backdrop-blur-sm px-1.5 py-0.5 border border-foreground/[0.06] rounded">
                                {product.metadata?.format || 'WAV'} • {product.metadata?.count || '140'} samples
                            </div>

                            {/* Free badge if applicable */}
                            {product.amount === 0 && (
                                <div className="absolute top-2 right-2 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--background)] bg-primary px-2 py-0.5">
                                    Free
                                </div>
                            )}
                        </Link>

                        {/* ─── INFO SECTION ─── */}
                        <div className="px-3 md:px-4 py-3 space-y-2">
                            {/* Name + Price row */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-gothic text-lg md:text-xl text-foreground leading-tight tracking-wide">
                                        <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors duration-200">
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="font-mono text-[10px] text-foreground/40 mt-0.5 line-clamp-1">
                                        {product.description || "Digital audio sample pack"}
                                    </p>
                                </div>
                                <span className="font-mono text-base md:text-lg font-bold text-primary shrink-0 pt-0.5">
                                    {product.amount === 0 ? 'Free' : `$${product.amount}`}
                                </span>
                            </div>

                            {/* Action row */}
                            <div className="flex items-center justify-between pt-2 border-t border-foreground/[0.06]">
                                {/* Preview */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(true);
                                    }}
                                    className="font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-foreground/15 text-foreground/60 hover:text-primary hover:border-primary/40 transition-all duration-200 flex items-center gap-1.5 active:scale-[0.97]"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Preview
                                </button>

                                {/* Add to cart */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product);
                                    }}
                                    disabled={isInCart}
                                    className={`font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-all duration-200 active:scale-[0.97] ${isInCart
                                        ? 'text-primary/50 border-primary/20 cursor-default'
                                        : 'text-[var(--background)] bg-primary border-primary hover:bg-primary/90'
                                        }`}
                                >
                                    {isInCart ? 'Added ✓' : 'Add to Cart'}
                                </button>
                            </div>

                            {/* Mobile swipe hint */}
                            <div className="md:hidden flex items-center justify-center gap-1.5 pt-0.5">
                                <span className="font-mono text-[8px] text-foreground/20 uppercase tracking-widest">swipe to preview</span>
                                <motion.svg
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-foreground/20"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </motion.svg>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ─── PREVIEW PANEL ─── */
                    <motion.div
                        key="preview"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="flex flex-col bg-[var(--background)] z-30"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.25}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Top — same aspect-[4/3] as image area */}
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <div className="absolute inset-0 p-2 flex flex-col justify-center">
                                {/* Header row */}
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                        <span className="font-mono text-[9px] text-foreground/40 uppercase tracking-wider">Preview</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowPreview(false);
                                        }}
                                        className="text-foreground/30 hover:text-foreground transition-colors w-11 h-8 flex items-center justify-center -mr-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Main Preview — same component as one-shots, with loop */}
                                {audioPreviewUrl && showPreview && (
                                    <div className="w-full h-[40px] mb-2">
                                        <OneShotPlayer
                                            audioUrl={audioPreviewUrl}
                                            isActive={showPreview}
                                            loop={true}
                                        />
                                    </div>
                                )}

                                {/* One-Shots */}
                                <div className="flex flex-col gap-2 min-h-0">
                                    {samples.map((url, index) => (
                                        <div key={index}>
                                            <span className="font-mono text-[8px] text-foreground/30 mb-0.5 block">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div className="w-full h-[40px]">
                                                <OneShotPlayer
                                                    audioUrl={url}
                                                    isActive={showPreview}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {samples.length === 0 && (
                                        <div className="flex items-center justify-center border border-dashed border-foreground/[0.06] rounded h-[40px]">
                                            <span className="font-mono text-[9px] text-foreground/20 uppercase">No samples</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom — mirrors default card info section exactly */}
                        <div className="px-3 md:px-4 py-3 space-y-2">
                            {/* Name + Price */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-gothic text-lg md:text-xl text-foreground leading-tight tracking-wide">
                                        {product.name}
                                    </h3>
                                    <p className="font-mono text-[10px] text-foreground/40 mt-0.5 line-clamp-1">
                                        {product.description || "Digital audio sample pack"}
                                    </p>
                                </div>
                                <span className="font-mono text-base md:text-lg font-bold text-primary shrink-0 pt-0.5">
                                    {product.amount === 0 ? 'Free' : `$${product.amount}`}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-foreground/[0.06]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(false);
                                    }}
                                    className="font-mono text-[10px] uppercase tracking-wider text-foreground/35 hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Back
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product);
                                    }}
                                    disabled={isInCart}
                                    className={`font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all duration-200 rounded ${isInCart
                                        ? 'text-primary/50 border border-primary/20 cursor-default'
                                        : 'text-[var(--background)] bg-primary hover:bg-primary/90 active:scale-[0.97]'
                                        }`}
                                >
                                    {isInCart ? 'Added ✓' : 'Add to Cart'}
                                </button>
                            </div>

                            {/* Mobile swipe hint */}
                            <div className="md:hidden flex items-center justify-center gap-1.5 pt-0.5">
                                <motion.svg
                                    animate={{ x: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-foreground/20"
                                >
                                    <polyline points="15 18 9 12 15 6" />
                                </motion.svg>
                                <span className="font-mono text-[8px] text-foreground/20 uppercase tracking-widest">swipe back</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
