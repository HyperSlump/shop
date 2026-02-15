import { getProductById } from '@/lib/stripe/products';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WaveformOverlay from '@/components/WaveformOverlay';
import OneShotPlayer from '@/components/OneShotPlayer';
import MatrixSpace from '@/components/MatrixSpace';

// Force dynamic behavior since we fetch data that might change
export const dynamic = 'force-dynamic';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    // Audio Logic
    const audioPreviewUrl = product.metadata?.audio_preview;
    const samples = [
        product.metadata?.sample_1,
        product.metadata?.sample_2,
        product.metadata?.sample_3,
        product.metadata?.sample_4,
    ].filter(Boolean);

    return (
        <div className="relative min-h-screen bg-[var(--background)]">
            {/* Main Content Area - Layout Adjustments */}
            {/* Removed md:ml-20 (handled by layout), added md:mr-20 (right gutter), and padding */}
            <div className="flex flex-col md:flex-row min-h-screen md:mr-20 p-4 md:p-8 gap-6 overflow-hidden">

                {/* LEFT PANEL: VISUALS (50% Width on Desktop, Full Height) */}
                <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen border-b md:border-b-0 md:border-r border-primary/20 group">
                    {/* Image Container */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            alt={product.name}
                            src={product.image || 'https://via.placeholder.com/1000'}
                            fill
                            className="object-cover opacity-80 contrast-125 grayscale group-hover:grayscale-0 transition-all duration-700"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-50" />
                    </div>

                    {/* Matrix/Glitch Overlay */}
                    <div className="absolute inset-0 z-10 opacity-20 pointer-events-none mix-blend-screen">
                        <MatrixSpace isVisible={true} />
                    </div>

                    {/* Return Link (floating) */}
                    <Link href="/" className="absolute top-6 left-6 z-50 font-mono text-xs text-white/70 hover:text-primary transition-colors flex items-center gap-2 bg-black/50 px-3 py-1 backdrop-blur-sm border border-white/10 hover:border-primary/50">
                        <span>&lt; RETURN_TO_GRID</span>
                    </Link>
                </div>

                {/* RIGHT PANEL: CONSOLE (50% Width on Desktop, Full Height) */}
                <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen bg-[var(--background)] flex flex-col border-l border-white/5">

                    {/* 1. TOP: HEADER & META (Flex shrink) */}
                    <div className="p-6 md:p-10 border-b border-primary/20 flex flex-col gap-4 bg-black/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-[10px] font-mono text-primary/60 mb-1 tracking-widest uppercase">
                                    // ASSET_ID: {product.id.slice(0, 8)}
                                </div>
                                <h1 className="font-gothic text-4xl md:text-6xl text-foreground leading-none tracking-tight uppercase">
                                    {product.name}
                                </h1>
                            </div>
                            <div className="text-right">
                                <div className="inline-block border border-primary text-primary px-3 py-1 font-mono text-lg font-bold">
                                    {product.amount === 0 ? 'FREE' : `$${product.amount}`}
                                </div>
                            </div>
                        </div>

                        <p className="font-mono text-xs md:text-sm text-foreground/60 max-w-md leading-relaxed">
                            {product.description || "High-fidelity industrial audio textures. Optimized for cinematic sound design and electronic music production."}
                        </p>
                    </div>

                    {/* 2. MIDDLE: AUDIO CONSOLE (Flex grow - takes available space) */}
                    <div className="flex-1 relative flex flex-col p-6 md:p-10 gap-6 overflow-y-auto custom-scrollbar">

                        {/* Main Waveform */}
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-sm animate-pulse" />
                                <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.2em]">MAIN_PREVIEW_STREAM.WAV</span>
                            </div>
                            {audioPreviewUrl ? (
                                <div className="relative w-full h-24 md:h-32 bg-black/20 border border-primary/40 rounded overflow-hidden group/wave shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                                    <WaveformOverlay audioUrl={audioPreviewUrl} isActive={true} />
                                </div>
                            ) : (
                                <div className="w-full h-24 flex items-center justify-center border border-dashed border-primary/20 text-primary/30 font-mono text-xs">
                                    NO_AUDIO_SOURCE
                                </div>
                            )}
                        </div>

                        {/* One Shots Grid */}
                        {samples.length > 0 && (
                            <div className="w-full">
                                <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest mb-3 block text-right border-b border-primary/10 pb-1">
                                    // EXTRACTED_SAMPLES_ARRAY [{samples.length}]
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    {samples.map((url, index) => (
                                        <OneShotPlayer
                                            key={index}
                                            audioUrl={url}
                                            label={`SAMPLE_0${index + 1}`}
                                            isActive={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Specs Table */}
                        <div className="mt-auto pt-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary/10 pt-4">
                                {[
                                    { k: 'FORMAT', v: product.metadata?.format || 'WAV' },
                                    { k: 'RATE', v: '48kHz/24bit' },
                                    { k: 'SIZE', v: product.metadata?.size || 'N/A' },
                                    { k: 'TYPE', v: 'ROYALTY_FREE' }
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-1">
                                        <span className="text-[9px] font-mono text-primary/40 tracking-widest">{spec.k}</span>
                                        <span className="text-xs font-mono text-foreground/80">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. BOTTOM: ACTION BAR (Fixed height) */}
                    <div className="p-6 md:p-10 border-t border-primary/20 bg-black/10 backdrop-blur-sm">
                        {/* Placeholder for Add to Cart Logic - passing product prop conceptually */}
                        {/* Since we are in a server component, we need a Client Component wrapper for the button if we use context */}
                        {/* For now, just a button styled correctly */}
                        <button
                            className="w-full h-14 bg-primary text-black font-mono text-sm md:text-base font-bold tracking-[0.2em] uppercase hover:bg-white transition-all duration-300 flex items-center justify-center gap-4 group shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                        >
                            <span>Initialize_Download</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <div className="mt-3 flex justify-between text-[9px] font-mono text-primary/40 uppercase">
                            <span>SECURE_LINK: ENCRYPTED</span>
                            <span>INSTANT_DELIVERY_SYSTEM</span>
                        </div>
                    </div>

                </div>

            </div>
        </div >
    );
}
