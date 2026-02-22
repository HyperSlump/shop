'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import MatrixSpace from './MatrixSpace';
import GrainedNoise from './GrainedNoise';
import { useCart, Product } from './CartProvider';
import { usePreviewPlayer } from './PreviewPlayerProvider';
import { useEffect, useState } from 'react';

interface ProductPageLayoutProps {
    product: Product;
}

export default function ProductPageLayout({ product }: ProductPageLayoutProps) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const { addToCart, cart } = useCart();
    const isPhysical = product.metadata?.type === 'PHYSICAL';
    const audioPreviewUrl = !isPhysical ? product.metadata?.audio_preview : undefined;
    const formatLabel = typeof product.metadata?.format === 'string' ? product.metadata.format.toUpperCase() : 'WAV';
    const oneShotCount = typeof product.metadata?.count === 'string' ? product.metadata.count : '140';

    const { playTrack, isTrackActive, isPlaying, isOpen, registerTrack, unregisterTrack } = usePreviewPlayer();

    useEffect(() => {
        if (audioPreviewUrl) {
            registerTrack({
                id: product.id,
                title: product.name,
                subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
                image: product.image,
                audioUrl: audioPreviewUrl,
            });
        }
        return () => unregisterTrack(product.id);
    }, [product, audioPreviewUrl, formatLabel, oneShotCount, registerTrack, unregisterTrack]);
    const isActivePreview = isOpen && isTrackActive(product.id);

    const playPreview = () => {
        if (!audioPreviewUrl) return;
        playTrack({
            id: product.id,
            title: product.name,
            subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
            image: product.image,
            audioUrl: audioPreviewUrl,
        });
    };
    const isInCart = cart.some(item => {
        if (isPhysical) {
            return item.metadata?.variant_id === String(selectedVariant?.id);
        }
        return item.id === product.id;
    });

    const handleAddToCart = () => {
        if (!isPhysical) {
            addToCart(product);
            return;
        }

        if (!selectedVariant) return;

        const cartProduct: Product = {
            ...product,
            id: `pf_${product.metadata?.printful_id}_${selectedVariant.id}`,
            amount: parseFloat(selectedVariant.retail_price),
            metadata: {
                ...product.metadata,
                variant_id: String(selectedVariant.id),
                variant_name: selectedVariant.name,
            }
        };
        addToCart(cartProduct);
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const DETAILED_DESCRIPTIONS: Record<string, string> = {
        'VOID_TEXTURES_01': "A collection of high-fidelity audio artifacts harvested from corrupted data streams. These textures have been processed through analog distortion circuits and granular synthesis engines to create a sense of vast, empty space. ideal for cinematic sound design, dark ambient, and industrial techno. Expect heavy sub-bass drones, metallic scrapes, and digital interference patterns.",
        'BROKEN_DRUMS_X': "Rhythmic glitches and decimated percussion loops. Each sample has been rigorously tested for maximum impact and textural grit. This pack contains hard-hitting kicks, snapping snares, and erratic hi-hat patterns that defy standard quantization. Perfect for adding a chaotic, human feel to mechanical beats.",
        'NEURO_BASS_V2': "Twisted low-end frequencies and reese basslines designed to tear through the mix. Synthesized using advanced frequency modulation and wave-shaping techniques. These sounds are essential for drum and bass, neurofunk, and heavy dubstep production. Warning: High levels of spectral saturation.",
        'CORTEX_LOOPS': "Brain-melting synth loops and arpeggios recorded from a custom modular eurorack system. These sequences are generative and evolving, providing endless inspiration for IDM and experimental electronic music. Contains complex polyrhythms and microtonal melodies.",
        'GLITCH_ARTIFACTS': "Pure digital error. Datamosh sounds, signal interference, and buffer underruns. These samples capture the beauty of technology failing. Use them as rhythmic elements, FX transitions, or to add a layer of digital decay to your tracks.",
        'ACID_WASH_303': "Squelchy, resonant acid lines directly from a modified TB-303. Recorded through a chain of vintage distortion pedals and tape delays. These loops scream with analog warmth and aggressive filter modulation. The definitive sound of underground rave culture.",
        'DISTORTION_UNIT': "A comprehensive library of impulse responses and heavy distortion FX chains. Run your clean sounds through these processors to add grit, warmth, and destruction. Includes bit-crushing, tube saturation, and wave-folding effects.",
        'VOCAL_CHOP_SYSTEM': "Futuristic vocal aesthetics for the modern producer. Processed vocal chops, granular synthesis textures, and formant-shifted phrases. These samples have been deconstructed and reassembled to create an alien, cybernetic vocal instrument.",
        'AMBIENT_WASH_IV': "Lush, evolving pads and drones that drift through the stereo field. Perfect for creating immersive backgrounds, intros, and breakdowns. These sounds are rich in harmonic content and slow modulation, evoking a sense of deep space and tranquility."
    };

    const extendedDescription = DETAILED_DESCRIPTIONS[product.name] ||
        (isPhysical ? "Exclusive physical merchandise. Professionally printed on demand and shipped globally using high-quality materials. Optimized for durability and comfort." : "This asset pack contains high-fidelity audio recordings processed via proprietary analog and digital chains. Optimal for advanced sound design, cinematic scoring, and experimental electronic music production. All files are rendered at 24-bit / 48kHz for maximum headroom and dynamic range. Expect minimal noise floor and maximum signal integrity.");

    const displayPrice = isPhysical && selectedVariant
        ? parseFloat(selectedVariant.retail_price)
        : product.amount;

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10"
        >
            <div className="w-full space-y-10">
                {/* Header System Line - Condensed */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-1 pt-4">
                        <h1 className="heading-h1 text-4xl md:text-6xl lg:text-7xl">
                            {product.name}
                        </h1>
                    </div>
                </div>

                {/* 2. Primary Content Grid - CONDENSED */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    {/* LEFT COLUMN: Visual & Technical Frame - MOVED UP */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Main Product Image Frame */}
                        <div className="relative aspect-square overflow-hidden group bg-foreground/5 dark:bg-white/5 border border-primary/10 rounded">
                            <Image
                                alt={product.name}
                                src={product.image || 'https://via.placeholder.com/1000'}
                                fill
                                className="object-contain opacity-80 contrast-125 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                                priority
                            />
                            <GrainedNoise />
                            <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none">
                                <MatrixSpace isVisible={true} />
                            </div>
                        </div>

                        {/* Technical Metadata Box */}
                        <div className="p-5 border border-primary/10 bg-black/20 flex flex-col gap-4 font-mono rounded">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { k: 'TYPE', v: isPhysical ? 'PHYSICAL_MERCH' : (product.metadata?.category || 'SAMPLE_PACK') },
                                    { k: isPhysical ? 'WEIGHT' : 'SIZE', v: isPhysical ? 'ESTIMATED_400G' : (product.metadata?.size || 'UNSPECIFIED') },
                                    { k: 'EDITION', v: isPhysical ? 'PRINT_ON_DEMAND' : 'LIFETIME_LICENSE' },
                                    { k: isPhysical ? 'SOURCE' : 'DEPTH', v: isPhysical ? 'PRINTFUL_NODE' : '24-BIT / 96' }
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-1">
                                        <span className="text-[8px] text-primary/30 uppercase tracking-tighter">{spec.k}</span>
                                        <span className="text-[11px] text-foreground/70 uppercase truncate">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Lore & Audio Console */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-base md:text-lg leading-relaxed opacity-90 max-w-prose whitespace-pre-wrap">
                                    {product.description}
                                </p>
                                <span className="text-2xl font-bold text-primary font-mono ml-4">
                                    ${displayPrice.toFixed(2)}
                                </span>
                            </div>

                            <div className="mt-8 border-l-2 border-primary/20 pl-6 py-2">
                                <h3 className="font-mono text-[10px] text-primary/50 uppercase tracking-widest mb-3">
                                    SYSTEM_ANALYSIS //
                                </h3>
                                <p className="font-mono text-[12px] md:text-sm text-foreground/60 leading-relaxed italic">
                                    {extendedDescription}
                                </p>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-2 space-y-6">
                            {isPhysical && product.variants && product.variants.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">
                                        VARIANT_SELECT //
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`h-10 px-4 border transition-all font-mono text-[10px] rounded uppercase flex flex-col items-center justify-center min-w-[80px]
                                                    ${selectedVariant?.id === v.id
                                                        ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(216,58,61,0.2)]'
                                                        : 'border-foreground/20 text-foreground/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                                                    }`}
                                            >
                                                <span>{v.name.split(' - ').pop()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {audioPreviewUrl && (
                                <button
                                    onClick={playPreview}
                                    className={`w-full h-14 flex items-center justify-center gap-4 font-mono text-sm font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded border
                                        ${isActivePreview && isPlaying
                                            ? 'bg-primary/20 text-primary border-primary/50'
                                            : 'bg-transparent text-foreground/90 border-foreground/20 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {isActivePreview && isPlaying ? (
                                        <IconPlayerPauseFilled size={18} />
                                    ) : (
                                        <IconPlayerPlayFilled size={18} />
                                    )}
                                    <span>{isActivePreview && isPlaying ? 'PLAYING_PREVIEW' : 'STREAM_AUDIO_DEMO'}</span>
                                </button>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={isInCart}
                                className={`w-full h-16 flex items-center justify-center gap-6 font-mono text-sm font-bold tracking-[0.4em] uppercase transition-all duration-700 rounded
                                    ${isInCart
                                        ? 'bg-primary/5 border border-primary/10 text-primary/30 cursor-not-allowed'
                                        : 'bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary'
                                    }`}
                            >
                                <span>{isInCart ? 'ACCESS_GRANTED' : (isPhysical ? 'ADD_TO_CART' : 'DOWNLOAD_ACCESS')}</span>
                                {!isInCart && <span className="text-xl">→</span>}
                            </button>

                            <div className="mt-6 flex flex-wrap gap-4 opacity-30 text-[9px] font-mono uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    <span>Trans_Encrypted</span>
                                </div>
                                {isPhysical ? (
                                    <>
                                        <span>Tracking_Available</span>
                                        <span>Shipping: Worldwide</span>
                                    </>
                                ) : (
                                    <>
                                        <span>BPM: {product.metadata?.bpm || 'NONE'}</span>
                                        <span>KEY: {product.metadata?.key || 'NONE'}</span>
                                        <span>Format: {product.metadata?.format || 'WAV'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section Indicators */}
                <div className="flex flex-wrap gap-4 pt-8">
                    {['X_PROTO', 'Y_ALGO', 'Z_CORE', 'H_SLUMP'].map((tag) => (
                        <div key={tag} className="px-4 py-2 border border-foreground/10 text-[9px] font-mono opacity-30 hover:opacity-100 hover:border-primary/40 transition-all cursor-default uppercase tracking-widest rounded">
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
