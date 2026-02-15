'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';
import MatrixSpace from './MatrixSpace';
import { useCart } from './CartProvider';

import { Product } from './CartProvider';

interface ProductPageLayoutProps {
    product: Product;
}

export default function ProductPageLayout({ product }: ProductPageLayoutProps) {
    const { addToCart, cart } = useCart();
    const isInCart = cart.some(item => item.id === product.id);

    const audioPreviewUrl = product.metadata?.audio_preview;
    const samples = [
        product.metadata?.sample_1,
        product.metadata?.sample_2,
        product.metadata?.sample_3,
        product.metadata?.sample_4,
    ].filter(Boolean);

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

    const itemVariants = {
        initial: { opacity: 0, y: 15 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
        }
    };

    // Extended "Verbage" / Lore Map
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
        "This asset pack contains high-fidelity audio recordings processed via proprietary analog and digital chains. Optimal for advanced sound design, cinematic scoring, and experimental electronic music production. All files are rendered at 24-bit / 48kHz for maximum headroom and dynamic range. Expect minimal noise floor and maximum signal integrity.";

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex-1 w-full p-4 md:p-6 lg:p-8"
        >
            <div className="max-w-6xl mx-auto space-y-12">
                {/* 1. Header System Line (Synced with MockPages) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary/60 font-mono text-[10px] tracking-[0.3em]">
                            <span className="w-2 h-2 bg-primary animate-pulse" />
                            SYS_LOC // {product.name.toUpperCase()}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-gothic tracking-tighter leading-none lowercase">
                            {product.name}
                        </h1>
                    </div>
                    <div className="flex flex-col items-start md:items-end font-mono text-[10px] opacity-40">
                        <p>ACCESS_CODE: {product.id.slice(0, 10).toUpperCase()}</p>
                        <p>STATUS_ID: DATA_RECON_v7</p>
                    </div>
                </div>

                {/* 2. Primary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN: Lore & Audio Console */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="space-y-6">
                            <p className="font-mono text-[13px] md:text-base leading-relaxed opacity-80 max-w-prose">
                                {product.description}
                            </p>

                            <div className="mt-8 border-l-2 border-primary/20 pl-6 py-2">
                                <h3 className="font-mono text-[10px] text-primary/50 uppercase tracking-widest mb-3">
                                    SYSTEM_ANALYSIS //
                                </h3>
                                <p className="font-mono text-[12px] md:text-sm text-foreground/60 leading-relaxed italic">
                                    {extendedDescription}
                                </p>
                            </div>
                        </div>

                        {/* Audio Interface Container */}
                        <div className="p-6 border border-primary/10 bg-primary/[0.02] space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 font-mono text-[8px] opacity-20 uppercase tracking-widest">Console.active</div>

                            {/* Main Stream */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-red-500 animate-pulse rounded-full" />
                                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.2em]">MASTER_SIGNAL_STREAM</span>
                                </div>
                                {audioPreviewUrl ? (
                                    <div className="relative w-full h-[40px] bg-black/20 dark:bg-white/5 border border-primary/20 rounded-sm overflow-hidden group-hover:border-primary/40 transition-colors">
                                        <WaveformOverlay audioUrl={audioPreviewUrl} isActive={true} />
                                    </div>
                                ) : (
                                    <div className="h-20 flex items-center justify-center border border-dashed border-primary/10 text-[11px] font-mono text-primary/20">
                                        NO_SIGNAL_DETECTED
                                    </div>
                                )}
                            </div>

                            {/* Samples Utility Grid */}
                            {samples.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                                        <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">DRUM_SUB_SAMPLES</span>
                                        <span className="font-mono text-[9px] text-primary/20 opacity-50">{samples.length}_BANKS_ONLINE</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {samples.map((url, index) => (
                                            <OneShotPlayer
                                                key={index}
                                                audioUrl={url}
                                                label={`S_${index + 1}`}
                                                isActive={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technical Legend (Mock Style) */}
                            <div className="pt-4 border-t border-primary/5 space-y-3">
                                <div className="flex justify-between items-center text-[9px] font-mono opacity-50 uppercase tracking-widest">
                                    <span>Signal_Flux_Density</span>
                                    <span>[|||||||||||||---] 85%</span>
                                </div>
                                <div className="w-full h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-4">
                            <button
                                onClick={() => !isInCart && addToCart(product)}
                                disabled={isInCart}
                                className={`w-full h-16 flex items-center justify-center gap-6 font-mono text-sm font-bold tracking-[0.4em] uppercase transition-all duration-700
                                    ${isInCart
                                        ? 'bg-primary/5 border border-primary/10 text-primary/30 cursor-not-allowed'
                                        : 'bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary'
                                    }`}
                            >
                                <span>{isInCart ? 'ACCESS_GRANTED' : 'DOWNLOAD_ACCESS'}</span>
                                {!isInCart && <span className="text-xl">→</span>}
                            </button>

                            <div className="mt-6 flex flex-wrap gap-4 opacity-30 text-[9px] font-mono uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    <span>Trans_Encrypted</span>
                                </div>
                                <span>BPM: {product.metadata?.bpm || 'NONE'}</span>
                                <span>KEY: {product.metadata?.key || 'NONE'}</span>
                                <span>Format: {product.metadata?.format || 'WAV'}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visual Frame */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        {/* Main Product Image Frame (Mock Style) */}
                        <div className="relative aspect-square border-2 border-primary/10 overflow-hidden group bg-black/40">
                            {/* Scanning Line Animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] animate-scan z-20 pointer-events-none" />

                            <Image
                                alt={product.name}
                                src={product.image || 'https://via.placeholder.com/1000'}
                                fill
                                className="object-cover opacity-80 contrast-125 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                                priority
                            />

                            {/* Matrix Overlay Overlay */}
                            <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none">
                                <MatrixSpace isVisible={true} />
                            </div>

                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10" />

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-primary/40 z-30" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-primary/40 z-30" />

                            {/* Technical Label */}
                            <div className="absolute bottom-4 left-4 z-30 font-mono text-[9px] text-white/50 bg-black/60 px-2 py-1 border border-white/10 uppercase tracking-widest">
                                SRC_VISUAL // {product.id.slice(0, 4)}:RENDER_EX
                            </div>
                        </div>

                        {/* Technical Metadata Box */}
                        <div className="p-5 border border-primary/10 bg-black/20 flex flex-col gap-4 font-mono">
                            <div className="text-[10px] text-primary/40 flex justify-between uppercase border-b border-primary/10 pb-2">
                                <span>Metadata_Package</span>
                                <span>[Verified]</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { k: 'OBJECT', v: 'WARP_CORE' },
                                    { k: 'TYPE', v: product.metadata?.category || 'SAMPLE_PACK' },
                                    { k: 'SIZE', v: product.metadata?.size || 'UNSPECIFIED' },
                                    { k: 'BIT_DEPTH', v: '24-BIT / 96' }
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-1">
                                        <span className="text-[8px] text-primary/30 uppercase tracking-tighter">{spec.k}</span>
                                        <span className="text-[11px] text-foreground/70 uppercase truncate">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Return Link Styled */}
                        <Link href="/" className="inline-flex items-center gap-3 font-mono text-[10px] opacity-40 hover:opacity-100 transition-all hover:text-primary group mt-auto">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>RETURN_TO_BASE_TERMINAL</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Section Indicators (Synced with Mock) */}
                <div className="flex flex-wrap gap-4 pt-8">
                    {['X_PROTO', 'Y_ALGO', 'Z_CORE', 'H_SLUMP'].map((tag) => (
                        <div key={tag} className="px-4 py-2 border border-foreground/10 text-[9px] font-mono opacity-30 hover:opacity-100 hover:border-primary/40 transition-all cursor-default uppercase tracking-widest">
                            {tag}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </motion.div>
    );
}
