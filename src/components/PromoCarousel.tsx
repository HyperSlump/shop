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
        <div className="relative w-full h-full group/carousel flex flex-col items-center justify-center overflow-hidden">
            {/* DYNAMIC BACKGROUND GRADIENT */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(circle at 12% 10%, ${activePromo.accent}22 0%, transparent 40%),
                                 radial-gradient(circle at 88% 12%, ${activePromo.accent}11 0%, transparent 40%)`
                }}
            />

            {/* TECHNICAL GRID BACKGROUND */}
            <div className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="absolute inset-0 z-1 pointer-events-none opacity-[0.02] grayscale bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]" />

            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 lg:px-24 z-10 pt-32 pb-20 md:py-0"
                >
                    {/* LEFT CONTENT */}
                    <div className="w-full md:w-3/5 flex flex-col items-center md:items-start text-center md:text-left gap-6 md:gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-col gap-1"
                        >
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
                                FEATURED ASSET PACK
                            </span>
                        </motion.div>

                        <motion.div className="relative">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="jacquard-24-regular text-[5rem] md:text-[7rem] lg:text-[8rem] leading-[0.82] lowercase tracking-tight text-white mb-2"
                            >
                                {activePromo.title}
                            </motion.h2>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '80px' }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="h-[2px] bg-primary absolute -bottom-1 left-0"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex items-center gap-4 mt-4"
                        >
                            <div className="h-4 w-[2px] bg-primary" />
                            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/80 font-bold">
                                24-BIT MASTERED / IMMEDIATE DELIVERY
                            </p>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-muted text-[14px] md:text-[16px] leading-relaxed max-w-lg font-sans tracking-tight opacity-70"
                        >
                            {activePromo.description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex flex-wrap items-center gap-x-6 gap-y-2 opacity-40"
                        >
                            {['INSTANT DOWNLOAD', 'LIFETIME LICENSE', 'SECURE CHECKOUT'].map((tag) => (
                                <span key={tag} className="font-mono text-[9px] uppercase tracking-[0.2em]">{tag}</span>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-4 mt-8 md:mt-4"
                        >
                            <button
                                onClick={() => router.push(`/product/${activePromo.id}`)}
                                className="w-full sm:w-auto h-[48px] px-10 rounded-sm bg-primary text-white font-mono text-[11px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(216,58,61,0.25)] flex items-center justify-center"
                            >
                                Get Instant Access
                            </button>
                            <Link
                                href="/#catalog"
                                className="w-full sm:w-auto h-[48px] px-12 rounded-sm border border-white/10 bg-black/40 backdrop-blur-sm text-white font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center"
                            >
                                Browse Catalog
                            </Link>
                        </motion.div>
                    </div>

                    {/* RIGHT IMAGE SECTION */}
                    <div className="relative w-full md:w-2/5 h-full flex items-center justify-center p-8 lg:p-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="relative w-full max-w-[440px] aspect-[4/5] perspective-1000"
                        >
                            <div className="relative w-full h-full rounded-sm border border-white/10 bg-[#0f1113]/80 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col">
                                {/* CARD HEADER */}
                                <div className="p-4 flex items-center justify-between border-b border-white/5">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold border border-white/20 px-2 py-0.5 rounded-xs">
                                        PREVIEW
                                    </span>
                                </div>

                                {/* IMAGE CONTAINER */}
                                <div className="flex-1 relative m-4 rounded-xs overflow-hidden bg-black/40 border border-white/5">
                                    <Image
                                        src={activePromo.image}
                                        alt={activePromo.title}
                                        fill
                                        className="object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                {/* CARD FOOTER */}
                                <div className="p-5 flex flex-col gap-2">
                                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary font-bold opacity-80">
                                        CURRENT FEATURE
                                    </span>
                                    <h3 className="jacquard-24-regular text-2xl text-white lowercase leading-none">
                                        {activePromo.title}
                                    </h3>
                                </div>

                                <div className="absolute top-4 right-4 text-white/20">
                                    <IconDownload size={20} stroke={1.5} />
                                </div>
                            </div>

                            {/* DECORATIVE ACCENTS */}
                            <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-primary/20" />
                            <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-primary/20" />
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* BOTTOM PAGINATION & ARROWS */}
            <div className="absolute bottom-12 left-0 right-0 z-20 px-6 md:px-12 lg:px-24 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <span className="font-mono text-[16px] font-bold text-white tracking-widest">
                        {String(currentIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="h-[1px] w-12 bg-white/20" />
                    <span className="font-mono text-[12px] text-white/30 tracking-widest">
                        {String(promoSlides.length).padStart(2, '0')}
                    </span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
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
            </div>
        </div>
    );
}
