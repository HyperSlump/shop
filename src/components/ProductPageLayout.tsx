'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import WaveformOverlay from './WaveformOverlay';
import OneShotPlayer from './OneShotPlayer';
import MatrixSpace from './MatrixSpace';
import { useCart } from './CartProvider';

interface ProductPageLayoutProps {
    product: any;
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

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="relative min-h-screen w-full flex flex-col md:flex-row"
        >
            {/* LEFT SIDE: PRODUCT VISUAL (Compact Frame) */}
            <motion.div
                variants={itemVariants}
                className="relative w-full md:w-[45%] h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-primary/20 bg-black/5"
            >
                {/* Image Frame - Smaller than before, centered */}
                <div className="absolute inset-0 flex items-start justify-center px-6 md:px-10 lg:px-12 pt-24 md:pt-32">
                    <div className="relative w-full aspect-square max-h-[500px] border border-primary/20 shadow-2xl overflow-hidden group">
                        <Image
                            alt={product.name}
                            src={product.image || 'https://via.placeholder.com/1000'}
                            fill
                            className="object-cover opacity-90 contrast-125 grayscale group-hover:grayscale-0 transition-all duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />

                        {/* Technical Label */}
                        <div className="absolute bottom-2 left-2 z-20 font-mono text-[7px] text-white/40 bg-black/40 px-1 px-1.5 py-0.5">
                            SOURCE_IMG_V.01 // {product.id.slice(0, 8)}
                        </div>
                    </div>
                </div>

                {/* Matrix Background - Subtler */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <MatrixSpace isVisible={true} />
                </div>

                {/* Return Link */}
                <Link href="/" className="absolute top-4 left-6 md:top-6 md:left-10 lg:top-8 lg:left-12 z-50 font-mono text-[9px] text-foreground/40 hover:text-primary transition-colors flex items-center gap-2 px-2 py-1 border border-transparent hover:border-primary/20">
                    <span>[ BACK_TO_DATABASE ]</span>
                </Link>
            </motion.div>

            {/* RIGHT SIDE: CONTROL CENTER */}
            <div className="flex-1 flex flex-col bg-black/[0.02] dark:bg-white/[0.02]">
                {/* Header Section */}
                <motion.div variants={itemVariants} className="p-6 md:p-10 lg:py-12 lg:pl-12 lg:pr-20 border-b border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                            <span className="font-mono text-[8px] text-primary/40 uppercase tracking-[0.3em]">
                                // SYS_ENTRY: {product.id.slice(0, 8)}
                            </span>
                            <h1 className="font-gothic text-4xl md:text-5xl text-foreground leading-none tracking-tight">
                                {product.name}
                            </h1>
                        </div>
                        <div className="font-mono text-xl font-bold text-primary border-b-2 border-primary/20 pb-1">
                            {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                        </div>
                    </div>
                    <p className="font-mono text-[10px] md:text-[11px] text-foreground/50 max-w-lg leading-relaxed">
                        {product.description || "Experimental industrial audio dataset. High-fidelity spectral textures for advanced synthesis."}
                    </p>
                </motion.div>

                {/* Audio Console - Natural Flow */}
                <motion.div variants={itemVariants} className="flex-1 p-6 md:p-10 lg:py-12 lg:pl-12 lg:pr-20 flex flex-col gap-8">
                    {/* Main Stream */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-alert animate-pulse rounded-full" />
                            <span className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.2em]">AUDIO_STREAM_MASTER</span>
                        </div>
                        {audioPreviewUrl ? (
                            <div className="relative w-full h-16 bg-black/5 dark:bg-white/5 border border-primary/30 rounded overflow-hidden">
                                <WaveformOverlay audioUrl={audioPreviewUrl} isActive={true} />
                            </div>
                        ) : (
                            <div className="h-16 flex items-center justify-center border border-dashed border-primary/10 text-[9px] font-mono text-primary/20">
                                NO_SIGNAL_DETECTED
                            </div>
                        )}
                    </div>

                    {/* Samples Grid */}
                    {samples.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-primary/10 pb-1">
                                <span className="font-mono text-[9px] text-primary/40 uppercase tracking-widest">SUB_SAMPLES</span>
                                <span className="font-mono text-[8px] text-primary/20">{samples.length}_LOADED</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
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

                    {/* Technical Specs */}
                    <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-primary/10">
                        {[
                            { k: 'TYPE', v: 'WARP_CORE' },
                            { k: 'FORMAT', v: product.metadata?.format || 'WAV' },
                            { k: 'SIZE', v: product.metadata?.size || 'N/A' },
                            { k: 'RATE', v: '48k/24b' }
                        ].map((spec) => (
                            <div key={spec.k} className="flex flex-col">
                                <span className="text-[7px] font-mono text-primary/30 tracking-widest">{spec.k}</span>
                                <span className="text-[10px] font-mono text-foreground/70 uppercase">{spec.v}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer Action */}
                <motion.div variants={itemVariants} className="p-6 md:p-10 lg:py-12 lg:pl-12 lg:pr-20 border-t border-primary/10 bg-[var(--background)]">
                    <button
                        onClick={() => !isInCart && addToCart(product)}
                        disabled={isInCart}
                        className={`w-full h-12 flex items-center justify-center gap-4 font-mono text-xs font-bold tracking-[0.3em] uppercase transition-all duration-500 border-2
                            ${isInCart
                                ? 'border-primary/20 text-primary/40 cursor-not-allowed'
                                : 'border-primary bg-primary text-black hover:bg-[var(--background)] hover:text-primary'
                            }`}
                    >
                        <span>{isInCart ? 'ALREADY_IN_DATABASE' : 'INITIALIZE_ACQUISITION'}</span>
                        {!isInCart && <span className="text-lg">→</span>}
                    </button>
                    <div className="mt-4 flex justify-between items-center px-1 opacity-30 text-[7px] font-mono uppercase tracking-widest">
                        <span>Transmission_Encrypted</span>
                        <div className="flex gap-4">
                            <span>BPM: {product.metadata?.bpm || 'NONE'}</span>
                            <span>KEY: {product.metadata?.key || 'NONE'}</span>
                        </div>
                        <span>Protocol_Secure</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
