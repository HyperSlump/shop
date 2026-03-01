'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import GrainedNoise from './GrainedNoise';
import { AnimatePresence, motion } from 'framer-motion';

interface Slide {
  title: string;
  kicker: string;
  body: string;
  image: string;
  foregroundImage?: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

type GraphiteMeta = {
  image?: string;
  href?: string;
};

type CatalogProduct = {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  image?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
};

const SLIDE_DURATION_MS = 10000;
const PHYSICAL_BACKGROUNDS = [
  'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Reimagine_this_35b0e0f374.jpeg',
  'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/3d_crystaline_shapes_glittery_y2k_background_508a4763f4%20%281%29.jpeg',
  'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ChatGPT%20Image%20Feb%2028%2C%202026%2C%2012_27_39%20PM.png',
  'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Recreate_black_and_white_5bd8c874bb.jpeg',
  'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_vdbnj0vdbnj0vdbn.png',
];

const slides: Slide[] = [
  {
    title: 'Archive Hat',
    kicker: 'Physical Merch // New Drop',
    body: 'Structured cap with signature hyper embroidery. Printed on demand and shipped worldwide.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_vdbnj0vdbnj0vdbn.png',
    foregroundImage: 'https://files.cdn.printful.com/files/3a6/3a62f4531060233eb27f1e822b8dc145_preview.png',
    ctaPrimary: { label: 'Shop This Hat', href: '/product/pf_421731819' },
    ctaSecondary: { label: 'Browse Catalog', href: '/#catalog' },
  },
  {
    title: 'Graphite Jacket',
    kicker: 'Physical Merch // Graphite Variant',
    body: 'Stealth outer layer with reinforced seams and hyper$lump detailing. Printed on demand and ships worldwide.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_pe9bazpe9bazpe9b.png',
    ctaPrimary: { label: 'Shop Jacket', href: '/product/pf_graphite_jacket' },
    ctaSecondary: { label: 'Browse Catalog', href: '/#catalog' },
  },
  {
    title: 'Industrial Etherea',
    kicker: 'Sample Pack // Collection 001',
    body: 'High-fidelity cinematic soundscapes and aggressive industrial textures engineered for forward-thinking productions.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_unhreuunhreuunhr_cropped_processed_by_imagy.png',
    ctaPrimary: { label: 'Get The Pack', href: '/product/prod_RnA5vD8l4LzB1w' },
    ctaSecondary: { label: 'Listen Preview', href: '/#catalog' },
  },
  {
    title: 'Chrome Pulse',
    kicker: 'Serum Presets // Neon',
    body: 'Liquid wavetables and futuristic modulation. 60+ presets designed for the next wave of electronic music.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_Amid_a_pulsating_sea_of_vibrant_colors_a_2560x1440_digital_ad_for_top-tier_EDM_s-0%20%282%29.jpg',
    ctaPrimary: { label: 'Preview Presets', href: '/#catalog' },
  },
  {
    title: 'Basement Grit',
    kicker: 'One-Shot Series // Vol. 4',
    body: 'Analog distortion and raw drum hits recorded through vintage preamps for maximum heat.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_Amid_a_pulsating_sea_of_vibrant_colors_and_mesmerizing_patterns_a_2560x1440_digi-0.jpg',
    ctaPrimary: { label: 'Get One-Shots', href: '/#catalog' },
  },
  {
    title: 'Signal Relic',
    kicker: 'Hero Visual // Feb 2026',
    body: 'Fresh cinematic key visual anchoring the current storefront campaign.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ChatGPT%20Image%20Feb%2028%2C%202026%2C%2012_27_39%20PM.png',
    ctaPrimary: { label: 'Shop Feature', href: '/#catalog' },
  },
  {
    title: 'Analog Artifact',
    kicker: 'Glitch & Noise // Vol. 2',
    body: 'Broken transmissions and beautiful errors. A massive collection of authentic analog video and audio artifacts.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Gemini_Generated_Image_1ttktb1ttktb1ttk_cropped_processed_by_imagy.png',
    ctaPrimary: { label: 'Explore Artifacts', href: '/#catalog' },
  },
  {
    title: 'Etherea Abstract',
    kicker: 'Background Visual // Storefront',
    body: 'High-contrast abstract gradient generated for immersive hero backdrops.',
    image: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/ideogram-v3.0_generate_a_2560x1440_abstract_digital_ad_for_edm_sample_packs-0.jpg',
    ctaPrimary: { label: 'View Collection', href: '/#catalog' },
  },
];

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [graphite, setGraphite] = useState<GraphiteMeta>({});
  const [catalogSlides, setCatalogSlides] = useState<Slide[]>([]);

  const shuffleArray = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => (res.ok ? res.json() : null))
      .then((data: CatalogProduct[] | null) => {
        if (!data || !Array.isArray(data)) return;
        const shuffled = shuffleArray(data);
        let physicalIndex = 0;
        const mapped = shuffled
          .map<Slide | null>((product) => {
            const isPhysical = (product.metadata?.type || '').toUpperCase() === 'PHYSICAL';
            const bg = isPhysical
              ? PHYSICAL_BACKGROUNDS[physicalIndex++ % PHYSICAL_BACKGROUNDS.length]
              : product.image || PHYSICAL_BACKGROUNDS[0];
            const fg = product.image || bg;
            if (!bg) return null;
            return {
              title: product.name || 'Catalog Item',
              kicker: isPhysical ? 'Physical Merch // Catalog' : 'Digital Release // Catalog',
              body: product.description || (isPhysical
                ? 'Exclusive physical drop with refreshed mock imagery.'
                : 'Updated digital release featuring the newest mock product art.'),
              image: bg,
              foregroundImage: fg,
              ctaPrimary: { label: isPhysical ? 'View Product' : 'Get Release', href: `/product/${encodeURIComponent(product.id)}` },
              ctaSecondary: { label: 'Browse Catalog', href: '/#catalog' },
            };
          })
          .filter((slide): slide is Slide => slide !== null);
        if (mapped.length) {
          setCatalogSlides(mapped);
        }
      })
      .catch(() => {
        /* swallow errors to avoid blocking hero */
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/catalog/graphite-jacket')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!mounted || !data?.found) return;
        setGraphite({
          image: data.image,
          href: data.href,
        });
      })
      .catch(() => { /* ignore */ });
    return () => { mounted = false; };
  }, []);

  const baseSlides = useMemo(() => {
    return slides.map((slide) => {
      if (slide.title !== 'Graphite Jacket') return slide;
      return {
        ...slide,
        foregroundImage: graphite.image || slide.foregroundImage || slide.image,
        ctaPrimary: {
          ...slide.ctaPrimary,
          href: graphite.href || slide.ctaPrimary.href,
        },
      };
    });
  }, [graphite]);

  const renderedSlides = useMemo(() => {
    if (catalogSlides.length) return catalogSlides;
    return baseSlides;
  }, [baseSlides, catalogSlides]);

  useEffect(() => {
    if (!renderedSlides.length) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % renderedSlides.length), SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [renderedSlides.length]);

  useEffect(() => {
    if (index >= renderedSlides.length) {
      setIndex(0);
    }
  }, [renderedSlides.length, index]);

  const total = renderedSlides.length || 1;
  const displayIndex = total ? (index % total) + 1 : 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {renderedSlides.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ${i === index ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === index}
            className="object-cover scale-[1.02] saturate-0 brightness-[0.78] contrast-[1.08] blur-[1.2px] md:blur-[1.6px]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/75" />
          <GrainedNoise />
        </div>
      ))}

      <div className="relative z-10 h-full w-full max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10 md:gap-14">
        {/* Text column */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${index}`}
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="flex-1 max-w-xl space-y-5 text-white"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
              <span>{renderedSlides[index].kicker}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {renderedSlides[index].title}
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
              {renderedSlides[index].body}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={renderedSlides[index].ctaPrimary.href}
                className="inline-flex h-12 items-center justify-center rounded-md bg-white text-black px-5 text-[11px] font-bold uppercase tracking-[0.18em] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:brightness-95 transition"
              >
                {renderedSlides[index].ctaPrimary.label}
              </Link>
              {renderedSlides[index].ctaSecondary && (
                <Link
                  href={renderedSlides[index].ctaSecondary.href}
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white/10 transition"
                >
                  {renderedSlides[index].ctaSecondary.label}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Product visual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${index}`}
            initial={{ opacity: 0, x: 26, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -18, scale: 0.98 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="flex-1 w-full max-w-[520px]"
          >
            <div className="relative aspect-square rounded-3xl border border-white/12 bg-white/5 backdrop-blur-md overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <Image
                src={renderedSlides[index].foregroundImage || renderedSlides[index].image}
                alt={`${renderedSlides[index].title} visual`}
                fill
                className="object-cover"
                sizes="520px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal counter */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="font-mono text-[10px] tracking-[0.24em] text-white/70">
          {String(displayIndex).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <div className="w-28 h-[2px] bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(displayIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Side navigation arrows */}
      <div className="absolute inset-y-0 left-4 md:left-6 flex items-center z-10">
        <button
          aria-label="Previous slide"
          onClick={() => setIndex((prev) => (prev === 0 ? renderedSlides.length - 1 : prev - 1))}
          className="h-12 w-12 rounded-full border border-border/70 bg-background/70 text-foreground/80 backdrop-blur-md transition-all duration-200 flex items-center justify-center hover:-translate-y-[1px] hover:border-primary/70 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
        >
          <IconChevronLeft size={22} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-6 flex items-center z-10">
        <button
          aria-label="Next slide"
          onClick={() => setIndex((prev) => (prev + 1) % renderedSlides.length)}
          className="h-12 w-12 rounded-full border border-border/70 bg-background/70 text-foreground/80 backdrop-blur-md transition-all duration-200 flex items-center justify-center hover:-translate-y-[1px] hover:border-primary/70 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
        >
          <IconChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
