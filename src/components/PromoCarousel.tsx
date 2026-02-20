'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Technical flavor templates to "industrialize" the product promotional data
const industrialTemplates = [
    {
        sub: "// NEURAL_DYNAMICS // 24-BIT_RESAMPLING // PROXIMITY_ALERT",
        desc: "SIGNAL_PURITY_RETAINED THROUGH VACUUM_TUBE_INTERFACES. DISCOVER THE LIMITS OF THE ANALOG_ABYSS WITH HIGH_FIDELITY_GLITCH_ARTIFACTS.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" // Tech/Hardware
    },
    {
        sub: "// ZERO_LATENCY_STREAM // CRYPTOGRAPHIC_DELIVERY",
        desc: "INSTANT_SYNC WITH THE GLOBAL_CORTEX. ENCRYPTED_ASSETS_FIRMWARE_READY FOR IMMEDIATE_INTEGRATION INTO YOUR SONIC_PIPELINE.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" // Brutalist Building
    },
    {
        sub: "// GRANULAR_RECONSTRUCTION // HARMONIC_DISTORTION",
        desc: "DECONSTRUCT_THE_WAVEFORM. REFINED_PERCUSSION_ENGINEERED_FOR_MAXIMUM_IMPACT IN HEAVY_INDUSTRIAL_AND_EXPERIMENTAL_CONTEXTS.",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" // Audio/DJ
    },
    {
        sub: "// PHASE_SHIFT_TECHNOLOGY // SUB-SONIC_CLARITY",
        desc: "DESIGNED_TO_SHAKE_THE_CHASSIS. EXPERIMENT_WITH_NEW_WAVEFORM_GEOMETRY AND UNCONVENTIONAL_DISTORTION_CURVES.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop" // Tech/Blue
    }
];

export default function PromoCarousel() {
    const [products, setProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch carousel products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const promos = useMemo(() => {
        if (products.length === 0) return [];
        return products.map((product, i) => {
            const template = industrialTemplates[i % industrialTemplates.length];
            return {
                id: product.id,
                name: product.name,
                sub: template.sub,
                desc: product.description || template.desc,
                image: product.image || template.image
            };
        });
    }, [products]);

    useEffect(() => {
        if (promos.length === 0) return;

        const timer = setInterval(() => {
            handleNext();
        }, 8000);

        return () => clearInterval(timer);
    }, [index, promos]);

    const handleNext = () => {
        const nextIndex = (index + 1) % promos.length;
        animateToSlide(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (index - 1 + promos.length) % promos.length;
        animateToSlide(prevIndex);
    };

    const animateToSlide = (newIndex: number) => {
        const tl = gsap.timeline({
            onComplete: () => setIndex(newIndex)
        });

        // Exit
        tl.to(contentRef.current, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power2.inOut"
        });

        tl.to(bgRef.current, {
            opacity: 0.5,
            scale: 1.1,
            duration: 0.8,
            ease: "power2.inOut"
        }, 0);
    };

    // Entry animation
    useEffect(() => {
        if (promos.length === 0) return;

        gsap.fromTo(contentRef.current,
            { opacity: 0, y: -40 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.2 }
        );

        gsap.fromTo(bgRef.current,
            { opacity: 0, scale: 1.2 },
            { opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" }
        );
    }, [index, promos]);

    if (loading || promos.length === 0) return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="font-mono text-[10px] text-white animate-pulse tracking-[1em] uppercase">SYSTEM_BOOTING_COMMENCING...</div>
        </div>
    );

    const activePromo = promos[index];

    return (
        <div ref={containerRef} className="relative w-full h-full group overflow-hidden bg-black">
            {/* BACKGROUND LAYER - Ken Burns Style */}
            <div
                ref={bgRef}
                className="absolute inset-0 z-0 scale-110"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${activePromo.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* OVERLAYS */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-10 noise opacity-[0.08] pointer-events-none" />

            {/* TECHNICAL DECORATIONS */}
            <div className="absolute top-28 left-12 z-20 hidden md:flex flex-col gap-1 opacity-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-primary" />
                    <span className="font-mono text-[9px] tracking-[0.4em] uppercase">LINK_ESTABLISHED</span>
                </div>
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase ml-11">DATA_STREAM_v2.09</span>
            </div>

            <div className="absolute bottom-12 left-12 z-20 hidden md:block opacity-40">
                <div className="font-mono text-[9px] tracking-[0.4em] uppercase mb-1">COORDINATES:</div>
                <div className="font-mono text-[12px] tracking-widest">40.7128° N, 74.0060° W</div>
            </div>

            {/* MAIN CONTENT BOX */}
            <div className="relative z-20 w-full h-full flex items-center px-8 md:px-24 max-w-[1600px] mx-auto">
                <div ref={contentRef} className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-4 opacity-70">
                        <div className="w-2 h-2 bg-primary animate-pulse" />
                        <span className="font-mono text-xs tracking-[0.6em] uppercase text-primary font-bold">FEAT_ASSET_DISP</span>
                    </div>

                    <h1 className="font-display text-5xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-[-0.05em] text-white mb-8 drop-shadow-2xl">
                        {activePromo.name}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                        <div className="space-y-4 max-w-lg">
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] font-bold text-white/60 uppercase border-l-2 border-primary pl-4">
                                {activePromo.sub}
                            </p>
                            <p className="font-mono text-[11px] md:text-sm tracking-tight text-white/40 uppercase leading-relaxed">
                                {activePromo.desc.slice(0, 180)}...
                            </p>
                        </div>

                        <div className="pt-4 md:pt-0">
                            <Link href={`/product/${activePromo.id}`}>
                                <button className="h-[48px] px-10 rounded-md font-sans font-medium text-[15px] transition-all duration-200 
                                                 bg-primary text-white 
                                                 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(99,91,255,0.4)]
                                                 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(99,91,255,0.5)]
                                                 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                                    Explore Archive
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLIDER NAVIGATION */}
            <div className="absolute bottom-12 right-12 z-30 flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-lg text-white font-bold">{String(index + 1).padStart(2, '0')}</span>
                    <div className="w-12 h-[2px] bg-white/20 relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${((index + 1) / promos.length) * 100}%` }}
                        />
                    </div>
                    <span className="font-mono text-xs text-white/40 uppercase tracking-widest">{String(promos.length).padStart(2, '0')}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-primary hover:text-primary transition-all text-white/40"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-primary hover:text-primary transition-all text-white/40"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* SIDE BAR DECORS */}
            <div className="absolute top-0 right-0 h-full w-20 flex flex-col items-center justify-center gap-12 pointer-events-none opacity-20 hidden lg:flex">
                <div className="vertical-text font-mono text-[9px] tracking-[1em] uppercase">SYSTEM_v4.5.X</div>
                <div className="w-[1px] h-32 bg-white/30" />
                <div className="vertical-text font-mono text-[9px] tracking-[1em] uppercase">HYPER$LUMP_PROTOCOL</div>
            </div>
        </div>
    );
}
