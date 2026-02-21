'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePreviewPlayer } from './PreviewPlayerProvider';

const AUTO_ROTATE_MS = 12000;

type ApiProduct = {
    id: string;
    name: string;
    description?: string | null;
    image?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
};

type PromoItem = {
    id: string;
    name: string;
    sub: string;
    desc: string;
    image: string;
    priceLabel: string;
};

type AmbientTheme = {
    base: string;
    depth: string;
    glowA: string;
    glowB: string;
    edge: string;
    grid: string;
};

const industrialTemplates = [
    {
        sub: "24-BIT_MASTERED / IMMEDIATE_DELIVERY",
        desc: "Sonic building blocks designed for fast deployment in high-impact productions.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
    },
    {
        sub: "SECURE_CHECKOUT / LIFETIME_ACCESS",
        desc: "Checkout is streamlined and encrypted so buyers can move from interest to ownership quickly.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
    },
    {
        sub: "CURATED_SIGNAL_CHAINS / MODERN_TEXTURES",
        desc: "Tight, usable assets made to drop directly into sessions without cleanup friction.",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
    },
    {
        sub: "ENGINEERED_FOR_SPEED / CREATIVE_CONTROL",
        desc: "From concept to final bounce with less searching and more committing to ideas.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop"
    }
];

const ambientThemesDark: AmbientTheme[] = [
    {
        base: '#0F0F12',
        depth: '#171A1C',
        glowA: 'rgba(200, 106, 131, 0.22)',
        glowB: 'rgba(123, 170, 178, 0.16)',
        edge: 'rgba(216, 58, 61, 0.12)',
        grid: 'rgba(167, 160, 164, 0.1)'
    },
    {
        base: '#0D0E10',
        depth: '#1A1D20',
        glowA: 'rgba(231, 214, 222, 0.12)',
        glowB: 'rgba(123, 170, 178, 0.14)',
        edge: 'rgba(200, 106, 131, 0.11)',
        grid: 'rgba(167, 160, 164, 0.09)'
    },
    {
        base: '#0B0C0D',
        depth: '#151719',
        glowA: 'rgba(200, 106, 131, 0.18)',
        glowB: 'rgba(236, 236, 236, 0.09)',
        edge: 'rgba(123, 170, 178, 0.1)',
        grid: 'rgba(167, 160, 164, 0.08)'
    },
    {
        base: '#101113',
        depth: '#191C1E',
        glowA: 'rgba(216, 58, 61, 0.16)',
        glowB: 'rgba(123, 170, 178, 0.14)',
        edge: 'rgba(200, 106, 131, 0.1)',
        grid: 'rgba(167, 160, 164, 0.08)'
    }
];

const ambientThemesLight: AmbientTheme[] = [
    {
        base: '#F3F3F3',
        depth: '#FFFFFF',
        glowA: 'rgba(200, 106, 131, 0.18)',
        glowB: 'rgba(123, 170, 178, 0.15)',
        edge: 'rgba(216, 58, 61, 0.1)',
        grid: 'rgba(18, 21, 23, 0.07)'
    },
    {
        base: '#F4F4F4',
        depth: '#FFFFFF',
        glowA: 'rgba(231, 214, 222, 0.2)',
        glowB: 'rgba(123, 170, 178, 0.14)',
        edge: 'rgba(200, 106, 131, 0.1)',
        grid: 'rgba(18, 21, 23, 0.07)'
    },
    {
        base: '#F2F2F2',
        depth: '#FEFEFF',
        glowA: 'rgba(200, 106, 131, 0.16)',
        glowB: 'rgba(123, 170, 178, 0.13)',
        edge: 'rgba(231, 214, 222, 0.12)',
        grid: 'rgba(18, 21, 23, 0.06)'
    },
    {
        base: '#F3F3F3',
        depth: '#FFFFFF',
        glowA: 'rgba(216, 58, 61, 0.08)',
        glowB: 'rgba(123, 170, 178, 0.14)',
        edge: 'rgba(200, 106, 131, 0.1)',
        grid: 'rgba(18, 21, 23, 0.06)'
    }
];

function formatPrice(amount?: number, currency?: string) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
        return "";
    }

    try {
        const normalizedCurrency = (currency || 'usd').toUpperCase();
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: normalizedCurrency,
            maximumFractionDigits: 0
        }).format(amount);
    } catch {
        return `$${Math.round(amount)}`;
    }
}

function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document === 'undefined') return true;
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

export default function PromoCarousel() {
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const isDark = useTheme();
    const { isOpen: isPreviewDockOpen, registerTrack, unregisterTrack } = usePreviewPlayer();
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products', { signal: controller.signal });
                if (!res.ok) {
                    throw new Error(`Failed to fetch products (${res.status})`);
                }

                const data: unknown = await res.json();
                if (!Array.isArray(data)) return;

                const parsed = data.filter((item): item is ApiProduct => {
                    if (typeof item !== 'object' || item === null) return false;
                    const maybeItem = item as Record<string, unknown>;
                    return typeof maybeItem.id === 'string' && typeof maybeItem.name === 'string';
                });

                setProducts(parsed);
            } catch (error) {
                if ((error as { name?: string }).name !== 'AbortError') {
                    console.error('Failed to fetch carousel products:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        return () => controller.abort();
    }, []);

    const promos = useMemo<PromoItem[]>(() => {
        if (products.length === 0) return [];

        return products.map((product, itemIndex) => {
            const template = industrialTemplates[itemIndex % industrialTemplates.length];
            return {
                id: product.id,
                name: product.name,
                sub: template.sub,
                desc: product.description?.trim() || template.desc,
                image: product.image || template.image,
                priceLabel: formatPrice(product.amount, product.currency)
            };
        });
    }, [products]);

    useEffect(() => {
        if (index < promos.length) return;
        setIndex(0);
    }, [index, promos.length]);

    useEffect(() => {
        promos.forEach(promo => {
            // Find the original product to get metadata
            const product = products.find(p => p.id === promo.id);
            const audioUrl = typeof product?.metadata?.audio_preview === 'string' ? product.metadata.audio_preview : '';
            if (audioUrl) {
                const oneShotCount = typeof product?.metadata?.count === 'string' ? product.metadata.count : '140';
                const formatLabel = typeof product?.metadata?.format === 'string' ? product.metadata.format.toUpperCase() : 'WAV';
                registerTrack({
                    id: promo.id,
                    title: promo.name,
                    subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
                    image: promo.image,
                    audioUrl: audioUrl,
                });
            }
        });

        return () => {
            promos.forEach(promo => unregisterTrack(promo.id));
        };
    }, [promos, products, registerTrack, unregisterTrack]);

    useEffect(() => {
        if (promos.length <= 1 || isPaused) return;

        const timer = window.setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % promos.length);
        }, AUTO_ROTATE_MS);

        return () => window.clearInterval(timer);
    }, [isPaused, promos.length]);

    const handleNext = () => {
        if (promos.length <= 1) return;
        setIndex((prevIndex) => (prevIndex + 1) % promos.length);
    };

    const handlePrev = () => {
        if (promos.length <= 1) return;
        setIndex((prevIndex) => (prevIndex - 1 + promos.length) % promos.length);
    };

    if (loading || promos.length === 0) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-black' : 'bg-background'}`}>
                <div className={`font-mono text-[10px] tracking-[0.35em] uppercase ${isDark ? 'text-white/60' : 'text-foreground/60'}`}>
                    Loading Featured Assets
                </div>
            </div>
        );
    }

    const activePromo = promos[index];
    const activeThemeSet = isDark ? ambientThemesDark : ambientThemesLight;
    const activeTheme = activeThemeSet[index % activeThemeSet.length];
    const revealDuration = reduceMotion ? 0.05 : 0.5;
    const backgroundDuration = reduceMotion ? 0.05 : 1.2;
    const ctaLabel = activePromo.priceLabel ? `Get Instant Access ${activePromo.priceLabel}` : 'Get Instant Access';
    const filmOverlay = isDark
        ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 45%, rgba(255,255,255,0.04) 100%)'
        : 'linear-gradient(180deg, rgba(26,26,27,0.02) 0%, rgba(26,26,27,0.01) 45%, rgba(26,26,27,0.04) 100%)';
    const directionalOverlay = isDark
        ? 'linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.74) 100%)'
        : 'linear-gradient(to right, rgba(255,255,255,0.94) 0%, rgba(250,250,250,0.84) 45%, rgba(243,243,243,0.62) 100%)';
    const glowOverlay = isDark
        ? 'radial-gradient(circle at 72% 40%, rgba(255,255,255,0.08), transparent 45%)'
        : 'radial-gradient(circle at 72% 40%, rgba(200,106,131,0.12), transparent 48%)';
    const headingClass = isDark ? 'text-white' : 'text-foreground';
    const sublineClass = isDark ? 'text-white/70' : 'text-foreground/72';
    const descClass = isDark ? 'text-white/78' : 'text-foreground/78';
    const metaClass = isDark ? 'text-white/55' : 'text-foreground/55';
    const separatorClass = isDark ? 'text-white/25' : 'text-foreground/25';
    const secondaryCtaClass = isDark
        ? 'border-white/25 text-white/80 hover:border-white/40 hover:text-white'
        : 'border-foreground/20 text-foreground/78 hover:border-foreground/40 hover:text-foreground';
    const cardBorderClass = isDark ? 'border-white/15' : 'border-foreground/15';
    const imageOverlayClass = isDark
        ? 'bg-gradient-to-b from-black/10 via-black/15 to-black/70'
        : 'bg-gradient-to-b from-white/0 via-white/8 to-black/30';
    const previewBadgeClass = isDark
        ? 'border-white/25 bg-black/35 text-white/90'
        : 'border-foreground/20 bg-white/65 text-foreground/90';
    const featureLabelClass = isDark ? 'text-white/55' : 'text-foreground/55';
    const featureNameClass = isDark ? 'text-white' : 'text-foreground';
    const navIndexClass = isDark ? 'text-white' : 'text-foreground';
    const navTrackClass = isDark ? 'bg-white/20' : 'bg-foreground/20';
    const navTotalClass = isDark ? 'text-white/40' : 'text-foreground/45';
    const navButtonClass = isDark
        ? 'border-white/20 text-white/70'
        : 'border-foreground/20 text-foreground/70';
    const ctaButtonClass = isDark
        ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(216,58,61,0.26)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_12px_28px_rgba(216,58,61,0.34)]'
        : 'shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_8px_24px_rgba(200,106,131,0.24)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_12px_28px_rgba(200,106,131,0.32)]';

    return (
        <div
            className={`relative w-full h-full group overflow-hidden ${isDark ? 'bg-black' : 'bg-background'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(nextTarget)) {
                    setIsPaused(false);
                }
            }}
        >
            <AnimatePresence mode="sync">
                <motion.div
                    key={activePromo.id}
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.01 }}
                    transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        backgroundImage: `radial-gradient(120% 90% at 14% 18%, ${activeTheme.glowA} 0%, transparent 55%), radial-gradient(90% 85% at 86% 12%, ${activeTheme.glowB} 0%, transparent 52%), radial-gradient(95% 95% at 74% 86%, ${activeTheme.edge} 0%, transparent 58%), linear-gradient(135deg, ${activeTheme.base} 0%, ${activeTheme.depth} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            </AnimatePresence>

            <div
                className="absolute inset-0 z-[5] pointer-events-none"
                style={{
                    backgroundImage: `${filmOverlay}, linear-gradient(to right, ${activeTheme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${activeTheme.grid} 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 28px 28px, 28px 28px'
                }}
            />

            <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: directionalOverlay }} />
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: glowOverlay }} />

            <div className="relative z-20 w-full h-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
                <div className="h-full grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePromo.id}
                            className="max-w-3xl"
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                            transition={{ duration: revealDuration, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.div
                                className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-primary/90 mb-4"
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: revealDuration, delay: 0.05 }}
                            >
                                Featured Asset Pack
                            </motion.div>

                            <motion.h1
                                className={`heading-h1 jacquard-24-regular text-5xl md:text-7xl lg:text-[7.25rem] ${headingClass}`}
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: revealDuration, delay: 0.1 }}
                            >
                                {activePromo.name}
                            </motion.h1>

                            <motion.div
                                className="mt-6 mb-6 h-[1px] w-28 bg-primary/70"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: revealDuration, delay: 0.15 }}
                                style={{ transformOrigin: 'left center' }}
                            />

                            <motion.div
                                className="space-y-4 max-w-xl"
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: revealDuration, delay: 0.2 }}
                            >
                                <p className={`font-mono text-[10px] md:text-xs tracking-[0.28em] font-bold uppercase border-l-2 border-primary pl-4 ${sublineClass}`}>
                                    {activePromo.sub}
                                </p>
                                <p className={`font-mono text-[11px] md:text-sm tracking-tight leading-relaxed max-w-[62ch] ${descClass}`}>
                                    {activePromo.desc.slice(0, 160)}
                                </p>
                            </motion.div>

                            <motion.div
                                className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] ${metaClass}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: revealDuration, delay: 0.24 }}
                            >
                                <span>Instant Download</span>
                                <span className={separatorClass}>/</span>
                                <span>Lifetime License</span>
                                <span className={separatorClass}>/</span>
                                <span>Secure Checkout</span>
                            </motion.div>

                            <motion.div
                                className="pt-7 flex flex-wrap items-center gap-3"
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: revealDuration, delay: 0.3 }}
                            >
                                <button
                                    onClick={() => router.push(`/product/${activePromo.id}`)}
                                    className={`h-[50px] px-8 rounded-none font-sans font-semibold text-[14px] tracking-wide inline-flex items-center gap-2
                                           bg-primary text-white transition-all duration-200
                                           ${ctaButtonClass}
                                           hover:-translate-y-0.5 active:translate-y-0`}
                                >
                                    {ctaLabel}
                                </button>
                                <Link
                                    href="/#catalog"
                                    className={`h-[50px] px-6 rounded-none font-mono font-semibold text-[11px] uppercase tracking-[0.22em] inline-flex items-center
                                           border transition-colors duration-200 ${secondaryCtaClass}`}
                                >
                                    Browse Catalog
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[440px] justify-self-center lg:justify-self-end">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePromo.id}
                                className={`relative aspect-[4/5] rounded-lg overflow-hidden border shadow-[0_20px_70px_rgba(0,0,0,0.45)] ${cardBorderClass}`}
                                initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: reduceMotion ? 0 : -12, scale: reduceMotion ? 1 : 1.01 }}
                                transition={{ duration: revealDuration + 0.15, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Image
                                    src={activePromo.image}
                                    alt={activePromo.name}
                                    fill
                                    sizes="(max-width: 1024px) 340px, 440px"
                                    className="object-cover"
                                />
                                <div className={`absolute inset-0 ${imageOverlayClass}`} />

                                <div className="absolute top-4 left-4">
                                    <span className={`inline-flex h-7 items-center rounded border px-2.5 font-mono text-[9px] uppercase tracking-[0.24em] ${previewBadgeClass}`}>
                                        Preview
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                                    <p className={`font-mono text-[9px] uppercase tracking-[0.3em] ${featureLabelClass}`}>Current Feature</p>
                                    <p className={`mt-1 font-sans text-sm md:text-base font-semibold ${featureNameClass}`}>{activePromo.name}</p>
                                    {activePromo.priceLabel ? (
                                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/95">
                                            {activePromo.priceLabel}
                                        </p>
                                    ) : null}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <motion.div
                animate={{ y: isPreviewDockOpen ? -96 : 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.85 }}
                className="absolute bottom-8 right-6 md:right-10 z-30 flex items-center gap-4"
            >
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-lg font-bold ${navIndexClass}`}>{String(index + 1).padStart(2, '0')}</span>
                    <div className={`w-14 h-[2px] relative ${navTrackClass}`}>
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${((index + 1) / promos.length) * 100}%` }}
                        />
                    </div>
                    <span className={`font-mono text-xs uppercase tracking-widest ${navTotalClass}`}>{String(promos.length).padStart(2, '0')}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous featured product"
                        className={`w-11 h-11 flex items-center justify-center border hover:border-primary hover:text-primary transition-all ${navButtonClass}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next featured product"
                        className={`w-11 h-11 flex items-center justify-center border hover:border-primary hover:text-primary transition-all ${navButtonClass}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
