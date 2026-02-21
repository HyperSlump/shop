'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=2070',
        badge: 'NEW ARRIVAL',
        accent: 'rgb(216, 58, 61)'
    },
    {
        id: 'prod_LzB1wRnA5vD8l4',
        title: 'basement grit',
        subtitle: 'one-shot series // vol.4',
        description: 'Authentic analog distortion and raw, unpolished drum hits. Recorded through vintage preamps for maximum heat.',
        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2029',
        badge: 'MOST POPULAR',
        accent: 'rgb(123, 170, 178)'
    },
    {
        id: 'prod_vD8l4LzB1wRnA5',
        title: 'chrome pulse',
        subtitle: 'serum presets // neon',
        description: 'Liquid wavetables and futuristic modulation. 60+ presets designed for the next wave of electronic music.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1964',
        badge: 'BEST SELLER',
        accent: 'rgb(200, 106, 131)'
    }
];

export default function PromoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const router = useRouter();

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

    const activePromo = promoSlides[currentIndex];

    const variants = {
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
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
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
        <div className="relative w-full max-w-[1400px] mx-auto group/carousel">
            <div className="relative h-[600px] md:h-[520px] overflow-hidden rounded-xl border border-border/80 bg-background/40 backdrop-blur-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">

                {/* Background Texture Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] grayscale bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]" />

                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 flex flex-col md:flex-row items-center justify-between"
                    >
                        {/* CONTENT SECTION */}
                        <div className="relative z-10 w-full md:w-1/2 p-8 md:p-16 flex flex-col items-start text-left order-2 md:order-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <span className="px-3 py-1 rounded-sm bg-foreground/5 dark:bg-foreground/10 border border-border/40 font-mono text-[10px] uppercase tracking-[0.2em] text-muted font-bold">
                                    {activePromo.badge}
                                </span>
                                <div className="h-px w-8 bg-border/60" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted/60 opacity-60">
                                    {activePromo.subtitle}
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="jacquard-24-regular text-[4rem] md:text-[5.5rem] leading-[0.85] lowercase mb-8 tracking-tighter"
                            >
                                {activePromo.title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-muted text-[15px] md:text-[17px] leading-relaxed max-w-md mb-10 font-sans tracking-tight"
                            >
                                {activePromo.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <button
                                    onClick={() => router.push(`/product/${activePromo.id}`)}
                                    className={`h-[50px] px-8 rounded-sm font-sans font-semibold text-[14px] tracking-wide inline-flex items-center gap-2
                           bg-primary text-white transition-all duration-200
                           ${ctaButtonClass}
                           hover:-translate-y-0.5 active:translate-y-0`}
                                >
                                    <IconDownload size={18} stroke={2.5} />
                                    <span>Get Started</span>
                                    <IconArrowRight size={16} stroke={2.5} className="ml-1" />
                                </button>
                                <Link
                                    href="/#catalog"
                                    className={`h-[50px] px-6 rounded-sm font-mono font-semibold text-[11px] uppercase tracking-[0.22em] inline-flex items-center
                           border transition-colors duration-200 ${secondaryCtaClass}`}
                                >
                                    Browse Catalog
                                </Link>
                            </motion.div>
                        </div>

                        {/* IMAGE SECTION */}
                        <div className="relative w-full md:w-1/2 h-full order-1 md:order-2 overflow-hidden flex items-center justify-center p-8 md:p-12">
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-background/40 z-10" />

                            <motion.div
                                className="relative w-full h-full max-w-[480px] aspect-square"
                                initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            >
                                {/* Decorative Frames */}
                                <div className="absolute -inset-4 border border-border/20 rounded-xl" />
                                <div className="absolute -inset-8 border border-border/10 rounded-2xl opacity-50" />

                                <div className="relative w-full h-full overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-md shadow-2xl group/img">
                                    <Image
                                        src={activePromo.image}
                                        alt={activePromo.title}
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] ease-out group-hover/img:scale-110"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent mix-blend-overlay" />

                                    {/* Floating Action Hint */}
                                    <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-primary animate-pulse">
                                            <IconPlayerPlayFilled size={16} />
                                        </div>
                                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white font-bold drop-shadow-md">
                                            Preview Soundscape
                                        </span>
                                    </div>
                                </div>

                                {/* Technical Corner Accents */}
                                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/50 translate-x-1 -translate-y-1" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/50 -translate-x-1 translate-y-1" />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* NAVIGATION BUTTONS */}
                <div className="absolute bottom-10 right-10 z-30 flex items-center gap-3">
                    <button
                        onClick={handlePrev}
                        className="w-12 h-12 flex items-center justify-center rounded-sm bg-background/60 backdrop-blur-md border border-border/60 text-muted hover:text-primary hover:border-primary/40 transition-all duration-200"
                        aria-label="Previous slide"
                    >
                        <IconChevronLeft size={22} stroke={2} />
                    </button>

                    <div className="flex gap-1.5 px-3">
                        {promoSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setDirection(idx > currentIndex ? 1 : -1);
                                    setCurrentIndex(idx);
                                }}
                                className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-primary' : 'w-1.5 bg-border/60 hover:bg-border'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-12 h-12 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 backdrop-blur-md border border-primary/20 text-primary hover:border-primary/40 transition-all duration-200"
                        aria-label="Next slide"
                    >
                        <IconChevronRight size={22} stroke={2} />
                    </button>
                </div>

                {/* Vertical Progress Indicator */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-4">
                    <span className="font-mono text-[9px] vertical-text uppercase tracking-[0.3em] text-muted/30">FEATURED_RELEASES</span>
                    <div className="w-px h-24 bg-border/20 relative">
                        <motion.div
                            className="absolute top-0 left-0 w-full bg-primary"
                            animate={{ height: `${((currentIndex + 1) / promoSlides.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="font-mono text-[10px] text-primary font-bold">0{currentIndex + 1}</span>
                </div>
            </div>
        </div>
    );
}
