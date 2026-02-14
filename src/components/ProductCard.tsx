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
            <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm p-6 flex flex-col justify-between transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                {/* Header */}
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-gothic text-2xl text-white">{product.name}</h3>
                        <span className="font-mono text-primary text-xs">{product.amount === 0 ? 'FREE' : `$${product.amount}`}</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/20" />
                    <p className="font-mono text-[10px] text-gray-300 leading-tight">
                        {product.description || "Raw industrial audio assets."}
                    </p>
                </div>

                {/* Main Waveform */}
                {audioPreviewUrl && isHovered && (
                    <div className="relative w-full h-16 bg-black/50 border border-white/10 rounded overflow-hidden shrink-0">
                        <div className="absolute top-1 left-2 text-[8px] text-primary uppercase tracking-widest">Main Preview</div>
                        <WaveformOverlay
                            audioUrl={audioPreviewUrl}
                            isActive={isHovered}
                        />
                    </div>
                )}

                {/* One Shots Grid */}
                {samples.length > 0 && (
                    <div className="space-y-1">
                        <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">One Shots</p>
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
                    className="w-full bg-primary text-black font-bold uppercase py-3 text-xs hover:bg-white transition-colors"
                >
                    {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
