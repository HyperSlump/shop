'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    IconChevronLeft,
    IconChevronRight,
    IconPlayerPlayFilled,
    IconArrowRight,
    IconDownload,
    IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import GrainedNoise from './GrainedNoise';
import { usePreviewPlayer } from './PreviewPlayerProvider';

interface PromoSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    badge: string;
    accent: string;
}

const promoSlides: PromoSlide[] = [
    {
        id: 'prod_RnA5vD8l4LzB1w',
        title: 'industrial etherea',
        subtitle: 'collection 001 // v1.2',
        description: 'High-fidelity cinematic soundscapes and aggressive industrial textures. Engineered for forward-thinking productions.',
        image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_generate_a_2560x1440_abstract_digital_ad_for_edm_sample_packs-0.jpg',
        badge: 'NEW ARRIVAL',
        accent: 'rgb(216, 58, 61)'
    },
    {
        id: 'prod_LzB1wRnA5vD8l4',
        title: 'basement grit',
        subtitle: 'one-shot series // vol.4',
        description: 'Authentic analog distortion and raw, unpolished drum hits. Recorded through vintage preamps for maximum heat.',
        image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_Amid_a_pulsating_sea_of_vibrant_colors_and_mesmerizing_patterns_a_2560x1440_digi-0.jpg',
        badge: 'MOST POPULAR',
        accent: 'rgb(123, 170, 178)'
    },
    {
        id: 'prod_vD8l4LzB1wRnA5',
        title: 'chrome pulse',
        subtitle: 'serum presets // neon',
        description: 'Liquid wavetables and futuristic modulation. 60+ presets designed for the next wave of electronic music.',
        image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_Amid_a_pulsating_sea_of_vibrant_colors_a_2560x1440_digital_ad_for_top-tier_EDM_s-0%20%282%29.jpg',
        badge: 'BEST SELLER',
        accent: 'rgb(200, 106, 131)'
    },
    {
        id: 'prod_liquid_dynamic_04',
        title: 'liquid state',
        subtitle: 'texture pack // vol.1',
        description: 'Viscous, morphing granular textures and liquid sound design recorded directly from experimental hardware.',
        image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_unhreuunhreuunhr_cropped_processed_by_imagy.png',
        badge: 'EXCLUSIVE',
        accent: 'rgb(180, 180, 180)'
    },
    {
        id: 'prod_analog_artifacts_05',
        title: 'analog artifact',
        subtitle: 'glitch & noise // vol.2',
        description: 'Broken transmissions and beautiful errors. A massive collection of authentic analog video and audio artifacts.',
        image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_1ttktb1ttktb1ttk_cropped_processed_by_imagy.png',
        badge: 'NEW RELEASE',
        accent: 'rgb(220, 90, 90)'
    }
];

export default function PromoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const router = useRouter();
    const { isOpen: isDockOpen } = usePreviewPlayer();

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const handlePrev = () => {
        setIsAutoPlaying(false);
        setDirection(-1);
        setCurrentIndex((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
    };

    // Touch swipe support for mobile
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
        }
        setTouchStart(null);
    };

    const activePromo = promoSlides[currentIndex];

    const variants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: 'spring' as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
            } as any
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: 'spring' as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            } as any
        })
    };

    const ctaButtonClass = activePromo.accent.includes('216')
        ? 'bg-primary hover:bg-primary/90'
        : activePromo.accent.includes('123')
            ? 'bg-[#7BAAB2] hover:bg-[#7BAAB2]/90'
            : 'bg-[#C86A83] hover:bg-[#C86A83]/90';

    const secondaryCtaClass = activePromo.accent.includes('216')
        ? 'border-primary/30 text-primary hover:bg-primary/5'
        : activePromo.accent.includes('123')
            ? 'border-[#7BAAB2]/30 text-[#7BAAB2] hover:bg-[#7BAAB2]/5'
            : 'border-[#C86A83]/30 text-[#C86A83] hover:bg-[#C86A83]/5';

    return (
        <div
            className="relative w-full h-full group/carousel flex flex-col items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* DYNAMIC BACKGROUND GRADIENT */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(circle at 12% 10%, ${activePromo.accent}22 0%, transparent 40%),
                                 radial-gradient(circle at 88% 12%, ${activePromo.accent}11 0%, transparent 40%)`
                }}
            />

            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 z-10"
                >
                    {/* FULL-BLEED BACKGROUND IMAGE */}
                    <div className="absolute inset-0">
                        <Image
                            src={activePromo.image}
                            alt={activePromo.title}
                            fill
                            priority
                            className="object-cover saturate-[0.10] brightness-[0.8] contrast-[1.1]"
                            sizes="100vw"
                        />
                        {/* Dark gradient overlay for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                        <GrainedNoise />
                    </div>

                    {/* DISTRIBUTED HUD OVERLAY */}
                    <div className="relative h-full w-full pointer-events-none">
                        {/* TOP LEFT METADATA */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.8 }}
                            className="absolute top-24 md:top-32 left-6 md:left-12 lg:left-24 flex items-center gap-4 opacity-60"
                        >
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white">
                                [SYS.VER.1.2 // STATUS: ACTIVE]
                            </span>
                            <span className="font-mono text-[9px] text-primary tracking-[0.2em] hidden md:block">
                                ID: {activePromo.id.split('_')[1]}
                            </span>
                        </motion.div>

                        {/* RIGHT EDGE BARCODE / ROTATED TEXT */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="absolute top-1/2 -translate-y-1/2 right-6 md:right-12 lg:right-24 hidden lg:flex flex-col items-end gap-12 opacity-30 origin-right"
                        >
                            <div className="font-mono text-[10px] tracking-[0.4em] text-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                {activePromo.subtitle}
                            </div>
                        </motion.div>

                        {/* LEFT EDGE ROTATED HUD */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 lg:left-8 hidden lg:flex flex-col items-center gap-8 opacity-40"
                        >
                            <div className="font-mono text-[8px] tracking-[0.5em] text-primary" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                {activePromo.badge}
                            </div>
                        </motion.div>

                        {/* CLEAN HUD TITLE */}
                        <div className={`absolute -translate-y-1/2 left-6 md:left-24 lg:left-32 z-10 w-full md:w-auto transition-all duration-300 ${isDockOpen ? 'top-[35%] md:top-[40%]' : 'top-[40%] md:top-[45%]'}`}>
                            <motion.div className="relative inline-block max-w-[80vw]">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                    className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-none whitespace-normal"
                                    style={{
                                        textShadow: '0 4px 24px rgba(0,0,0,0.9)'
                                    }}
                                >
                                    {activePromo.title}
                                </motion.h2>
                            </motion.div>
                        </div>

                        {/* BOTTOM DESCRIPTION & CTA (FLOATING) */}
                        <div className={`absolute left-6 md:left-24 lg:left-32 w-full md:w-[500px] lg:w-[600px] pointer-events-auto z-10 transition-all duration-300 ${isDockOpen ? 'bottom-56 md:bottom-48 lg:bottom-40' : 'bottom-32 md:bottom-24 lg:bottom-24'}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="flex flex-col gap-4 md:gap-5 max-w-[90%]"
                            >
                                <div className="flex items-center gap-3">
                                    <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-primary font-bold">
                                        24-BIT MASTERED / IMMEDIATE DELIVERY
                                    </p>
                                </div>

                                <p className="text-white/80 text-[14px] md:text-[16px] leading-relaxed font-sans tracking-tight bg-black/40 backdrop-blur-sm p-4 rounded-sm border-l-2 border-primary/50 shadow-xl">
                                    {activePromo.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 opacity-50 mt-1">
                                    {['INSTANT DOWNLOAD', 'LIFETIME LICENSE', 'SECURE CHECKOUT'].map((tag) => (
                                        <span key={tag} className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white">[{tag}]</span>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                                    <button
                                        onClick={() => router.push(`/product/${activePromo.id}`)}
                                        className="w-full sm:w-auto h-[48px] px-10 rounded-sm bg-primary text-white font-mono text-[11px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all shadow-[0_0_30px_rgba(216,58,61,0.3)] flex items-center justify-center relative group overflow-hidden"
                                    >
                                        <span className="relative z-10">Get Instant Access</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                    <Link
                                        href="/#catalog"
                                        className="w-full sm:w-auto h-[48px] px-10 rounded-sm border border-white/20 bg-black/40 backdrop-blur-md text-white font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        Browse Catalog
                                        <IconArrowRight size={14} className="opacity-50" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* BOTTOM PAGINATION & ARROWS */}
            <div className={`absolute left-0 right-0 z-20 px-6 md:px-12 lg:px-24 flex justify-end pointer-events-none transition-all duration-300 ${isDockOpen ? 'bottom-36 md:bottom-32 lg:bottom-28' : 'bottom-12'}`}>
                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                        >
                            <IconChevronLeft size={24} stroke={1.5} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                        >
                            <IconChevronRight size={24} stroke={1.5} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-mono text-[16px] font-bold text-white tracking-widest">
                            {String(currentIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="h-[1px] w-12 bg-white/20" />
                        <span className="font-mono text-[12px] text-white/30 tracking-widest">
                            {String(promoSlides.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
