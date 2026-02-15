'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const promos = [
    {
        text: "NEURO_PATCH_v4.5 :: SYNTHETIC_TEXTURE_PACK",
        sub: "// IMMERSIVE_AUDIO_ENGINEERING // 400+ UNIQUE_SAMPLES // CORTEX_COMPATIBLE",
        desc: "A DEEP_DIVE INTO THE ANALOG_ABYSS. RECONSTRUCT YOUR SONIC_ARCHITECTURE WITH VOID_BASS AND CRYSTALLINE_HIGHS."
    },
    {
        text: "FREE_SIGNAL_BROADCAST :: GLOBAL_DELIVERY",
        sub: "// ZERO_LATENCY_Fulfillment // ENCRYPTED_DOWNLOAD_STREAMS",
        desc: "ALL DIGITAL_ASSETS ARE DELIVERED VIA SECURE_LINK INSTANTLY AFTER PURCHASE. NO_WAITING // NO_FRICTION // ONLY_SPEED."
    },
    {
        text: "THE_CORTEX_COLLECTIVE :: DISCORD_SYNC",
        sub: "// COMMUNITY_DRIVEN_DEVELOPMENT // EXCLUSIVE_BETA_ACCESS",
        desc: "JOIN 5000+ SYNTHESIS_ENTHUSIASTS. SHARE PATCHES // TROUBLESHOOT // COLLABORATE ON THE NEXT_GENERATION OF HYPER$LUMP TOOLS."
    },
    {
        text: "ANALOG_GRIME_v2 :: LIMITED_COLLECTION",
        sub: "// ORGANIC_DISTORTION_CURVES // 24-BIT_RESAMPLING",
        desc: "RAW // UNFILTERED // INDUSTRIAL. CAPTURED FROM EXPERIMENTAL_OSCILLATORS AND DISTORTED THROUGH VINTAGE_HARDWARE."
    },
    {
        text: "VOID_ENGINE_v1.0 :: GRANULAR_PROCESSOR",
        sub: "// REAL-TIME_DESTRUCTION // PHASE_MODULATION_ALGORITHMS",
        desc: "DECONSTRUCT ANY INPUT SIGNAL INTO MICRO-PARTICULATES. ENGINEERED FOR CHAOS // REFINED FOR PRECISION."
    },
    {
        text: "EARLY_ACCESS_RESERVE :: Q1_ROADMAP",
        sub: "// PROTOCOL_ENHANCEMENTS // NEW_WAVEFORM_GEOMETRY",
        desc: "HOLDERS OF THE NEXUS_PASS RECEIVE PRIORITY ACCESS TO ALL UPCOMING MODULES AND EXPERIMENTAL KITS."
    },
    {
        text: "THERMAL_DYNAMICS :: KICK_DRUM_LABS",
        sub: "// SUB-SONIC_IMPACT // TRANSIENT_SHAPING_TOOLS",
        desc: "DESIGNED TO SHAKE THE CHASSIS. DISCOVER THE LIMITS OF LOW-END THEORY WITH OUR CUSTOM DESIGNED TRANSIENT KITS."
    }
];

export default function PromoCarousel() {
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
    }, [index]);

    useEffect(() => {
        // Heavy, Premium Phase In from Back + Enter Right
        const tl = gsap.timeline();

        // Placeholder "Phases" in - Languid and smooth
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

        // Text Animates in from Right with deliberate, slower stagger
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
    }, [index]);

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center gap-12 px-8 min-w-[800px] max-w-[1400px] h-[220px]"
        >
            {/* Massive Flash Frame Placeholder */}
            <div
                ref={placeholderRef}
                className="relative w-32 h-32 border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0"
            >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <div className="font-mono text-[9px] opacity-40 uppercase rotate-90 tracking-[0.5em] font-bold">CORTEX_SIGNAL_v4</div>
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-primary/60" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-primary/60" />
            </div>

            <div className="flex flex-col items-start text-left flex-1 py-6">
                <div
                    ref={textRef}
                    className="font-gothic text-2xl md:text-3xl lg:text-4xl tracking-widest text-primary lowercase mb-4"
                >
                    {promos[index].text}
                </div>
                <div
                    ref={subRef}
                    className="font-mono text-[9px] md:text-[10px] tracking-[0.5em] opacity-70 uppercase mb-4 border-l-2 border-primary/50 pl-6 leading-relaxed max-w-[800px]"
                >
                    {promos[index].sub}
                </div>
                <div
                    ref={descRef}
                    className="font-mono text-[8px] md:text-[9px] tracking-tight opacity-40 uppercase max-w-[800px] leading-relaxed"
                >
                    {promos[index].desc}
                </div>
            </div>
        </div>
    );
}
