'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

// Technical flavor templates to "industrialize" the product promotional data
const industrialTemplates = [
    {
        sub: "// NEURAL_DYNAMICS // 24-BIT_RESAMPLING // PROXIMITY_ALERT",
        desc: "SIGNAL_PURITY_RETAINED THROUGH VACUUM_TUBE_INTERFACES. DISCOVER THE LIMITS OF THE ANALOG_ABYSS WITH HIGH_FIDELITY_GLITCH_ARTIFACTS."
    },
    {
        sub: "// ZERO_LATENCY_STREAM // CRYPTOGRAPHIC_DELIVERY",
        desc: "INSTANT_SYNC WITH THE GLOBAL_CORTEX. ENCRYPTED_ASSETS_FIRMWARE_READY FOR IMMEDIATE_INTEGRATION INTO YOUR SONIC_PIPELINE."
    },
    {
        sub: "// GRANULAR_RECONSTRUCTION // HARMONIC_DISTORTION",
        desc: "DECONSTRUCT_THE_WAVEFORM. REFINED_PERCUSSION_ENGINEERED_FOR_MAXIMUM_IMPACT IN HEAVY_INDUSTRIAL_AND_EXPERIMENTAL_CONTEXTS."
    },
    {
        sub: "// PHASE_SHIFT_TECHNOLOGY // SUB-SONIC_CLARITY",
        desc: "DESIGNED_TO_SHAKE_THE_CHASSIS. EXPERIMENT_WITH_NEW_WAVEFORM_GEOMETRY AND UNCONVENTIONAL_DISTORTION_CURVES."
    },
    {
        sub: "// ULTRA-WIDE_STEREO_IMAGING // CORTEX_COMPATIBLE",
        desc: "RECONSTRUCT_YOUR_SONIC_ARCHITECTURE. VOID_CORE_SAMPLES_OPTIMIZED_FOR_BINAURAL_DEPTH AND PSYCHOACOUSTIC_IMMERSION."
    },
    {
        sub: "// ORGANIC_GRIT_v4.5 // BIT-CRUSHED_PRECISION",
        desc: "CAPTURED_FROM_EXPERIMENTAL_OSCILLATORS AND DISTORTED THROUGH VINTAGE_HARDWARE. RAW_UNFILTERED_INDUSTRIAL_FLAVORS FOR THE BOLD."
    },
    {
        sub: "// SYMBOLIC_RECONSTRUCTION // VOID_PROTOCOL",
        desc: "A DEEP_DIVE INTO THE SPECTRAL_VOID. HARVEST THE ESSENCE OF SYNTHETIC_TEXTURES AND RECONSTRUCT THEM INTO NEW_FORMS."
    }
];

export default function PromoCarousel() {
    const [products, setProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLAnchorElement>(null);
    const subRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    // Fetch products from the newly created API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Shuffle products for random promotion
                    const shuffled = [...data].sort(() => Math.random() - 0.5);
                    setProducts(shuffled);
                }
            } catch (error) {
                console.error('Failed to fetch carousel products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Memoize the promos with shuffled industrial flavor text
    const promos = useMemo(() => {
        if (products.length === 0) return [];

        return products.map((product, i) => {
            const template = industrialTemplates[i % industrialTemplates.length];
            return {
                text: product.name,
                sub: template.sub,
                desc: product.description || template.desc,
                href: `/product/${product.id}`,
                image: product.image
            };
        });
    }, [products]);

    useEffect(() => {
        if (promos.length === 0) return;

        const timer = setInterval(() => {
            const nextIndex = (index + 1) % promos.length;

            const tl = gsap.timeline({
                onComplete: () => setIndex(nextIndex)
            });

            // Smooth, Slow Exit Left + Phase Out
            tl.to([textRef.current, subRef.current, descRef.current], {
                opacity: 0,
                x: -80,
                duration: 1.5,
                stagger: 0.1,
                ease: "power3.inOut"
            }, 0);

            tl.to(placeholderRef.current, {
                opacity: 0,
                scale: 0.7,
                filter: "blur(15px)",
                duration: 1.5,
                ease: "power3.inOut"
            }, 0);
        }, 10000); // 10s Pause between cycles

        return () => clearInterval(timer);
    }, [index, promos]);

    useEffect(() => {
        if (promos.length === 0) return;

        // Heavy, Premium Phase In from Back + Enter Right
        const tl = gsap.timeline();

        // Placeholder "Phases" in
        tl.fromTo(placeholderRef.current,
            { opacity: 0, scale: 0.6, filter: "blur(30px)" },
            {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 2.8,
                ease: "power4.out"
            }, 0
        );

        // Text Animates in
        tl.fromTo([textRef.current, subRef.current, descRef.current],
            { opacity: 0, x: 80 },
            {
                opacity: 1,
                x: 0,
                duration: 2.5,
                stagger: 0.2,
                ease: "power4.out"
            }, 0.4
        );
    }, [index, promos]);

    if (loading || promos.length === 0) return (
        <div className="flex items-center justify-center gap-12 px-8 min-w-[800px] max-w-[1400px] h-[220px] opacity-20">
            <div className="font-mono text-[11px] animate-pulse uppercase tracking-[0.5em]">INITIALIZING_PROMO_FEED...</div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center gap-12 px-8 min-w-[800px] max-w-[1400px] h-[220px]"
        >
            {/* Real Product Image Frame */}
            <div
                ref={placeholderRef}
                className="relative w-32 h-32 border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0 group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
                {promos[index].image ? (
                    <img
                        src={promos[index].image}
                        alt={promos[index].text}
                        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-1000"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                        <div className="font-mono text-[10px] opacity-40 uppercase rotate-90 tracking-[0.5em] font-bold">CORTEX_SIGNAL_v4</div>
                    </>
                )}

                {/* Scanning Line Animation */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/40 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] animate-scan-slow pointer-events-none" />

                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-primary/60" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-primary/60" />
            </div>

            <div className="flex flex-col items-start text-left flex-1 py-6">
                <Link
                    href={promos[index].href}
                    ref={textRef}
                    className="group"
                >
                    <div className="font-gothic text-3xl md:text-4xl lg:text-5xl tracking-widest text-foreground group-hover:text-primary transition-colors duration-300 lowercase mb-2">
                        {promos[index].text}
                    </div>
                </Link>
                <div
                    ref={subRef}
                    className="font-mono text-[10px] md:text-[11px] tracking-[0.5em] opacity-70 uppercase mb-4 border-l-2 border-primary/50 pl-6 leading-relaxed max-w-[800px]"
                >
                    {promos[index].sub}
                </div>
                <div
                    ref={descRef}
                    className="font-mono text-[9px] md:text-[10px] tracking-tight opacity-40 uppercase max-w-[800px] leading-relaxed"
                >
                    {promos[index].desc}
                </div>
            </div>
        </div>
    );
}
