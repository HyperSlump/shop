'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import MatrixSpace from './MatrixSpace';
import { useCart, Product } from './CartProvider';
import { usePreviewPlayer } from './PreviewPlayerProvider';
import { useEffect, useState, useMemo, useCallback } from 'react';

interface ProductPageLayoutProps {
    product: Product;
}

type ProductVariant = NonNullable<Product['variants']>[number];

/* ─── Variant Parsing ─── */
const SIZE_LABELS = [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
    'Small', 'Medium', 'Large', 'Extra Large', 'One Size',
    'OS', 'OSFA',
];
const SIZE_SET = new Set(SIZE_LABELS.map(s => s.toLowerCase()));

function parseVariantName(fullName: string): { size: string; color: string; raw: string } {
    // Take the last segment after ' - ' (removes Printful product name prefix)
    const variantPart = fullName.split(' - ').pop() || fullName;
    const parts = variantPart.split('/').map(s => s.trim()).filter(Boolean);

    let size = '';
    let color = '';

    for (const part of parts) {
        if (SIZE_SET.has(part.toLowerCase())) {
            size = part;
        } else {
            color = color ? `${color} / ${part}` : part;
        }
    }

    // Fallback: if nothing parsed, treat the whole string as a label
    if (!size && !color) {
        return { size: variantPart, color: '', raw: variantPart };
    }

    return { size, color, raw: variantPart };
}


/* ─── Component ─── */
export default function ProductPageLayout({ product }: ProductPageLayoutProps) {
    /* ── Core state ── */
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, cart } = useCart();
    const isPhysical = product.metadata?.type === 'PHYSICAL';
    const audioPreviewUrl = !isPhysical ? product.metadata?.audio_preview : undefined;
    const formatLabel = typeof product.metadata?.format === 'string' ? product.metadata.format.toUpperCase() : 'WAV';
    const oneShotCount = typeof product.metadata?.count === 'string' ? product.metadata.count : '140';

    /* ── Audio Preview ── */
    const { playTrack, isTrackActive, isPlaying, isOpen, registerTrack, unregisterTrack } = usePreviewPlayer();

    useEffect(() => {
        if (audioPreviewUrl) {
            registerTrack({
                id: product.id,
                title: product.name,
                subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
                image: product.image,
                audioUrl: audioPreviewUrl,
            });
        }
        return () => unregisterTrack(product.id);
    }, [product, audioPreviewUrl, formatLabel, oneShotCount, registerTrack, unregisterTrack]);

    const isActivePreview = isOpen && isTrackActive(product.id);

    const playPreview = () => {
        if (!audioPreviewUrl) return;
        playTrack({
            id: product.id,
            title: product.name,
            subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
            image: product.image,
            audioUrl: audioPreviewUrl,
        });
    };

    /* ── Parsed variant data ── */
    const parsedVariants = useMemo(() => {
        if (!product.variants) return [];
        return product.variants.map(v => ({
            ...v,
            parsed: parseVariantName(v.name),
        }));
    }, [product.variants]);

    // Extract unique colors and sizes (preserving order)
    const { colors, sizes } = useMemo(() => {
        const colorList: string[] = [];
        const colorSeen = new Set<string>();
        const sizeList: string[] = [];
        const sizeSeen = new Set<string>();

        parsedVariants.forEach(v => {
            if (v.parsed.color && !colorSeen.has(v.parsed.color)) {
                colorSeen.add(v.parsed.color);
                colorList.push(v.parsed.color);
            }
            if (v.parsed.size && !sizeSeen.has(v.parsed.size)) {
                sizeSeen.add(v.parsed.size);
                sizeList.push(v.parsed.size);
            }
        });

        return { colors: colorList, sizes: sizeList };
    }, [parsedVariants]);

    // Derive selected color/size from the current variant
    const selectedParsed = selectedVariant ? parseVariantName(selectedVariant.name) : null;
    const selectedColor = selectedParsed?.color || '';
    const selectedSize = selectedParsed?.size || '';
    const [activeImage, setActiveImage] = useState(
        selectedVariant?.image || product.image || ''
    );
    const applyVariantSelection = useCallback((variant: ProductVariant | null) => {
        if (!variant) return;
        setSelectedVariant(variant);
        if (variant.image) {
            setActiveImage(variant.image);
        }
    }, []);

    /* ── Variant selection handlers ── */
    const handleColorSelect = useCallback((color: string) => {
        if (!product.variants) return;
        // Try to match the new color with the currently selected size first
        const match =
            parsedVariants.find(v => v.parsed.color === color && v.parsed.size === selectedSize) ||
            parsedVariants.find(v => v.parsed.color === color);
        if (match) {
            applyVariantSelection(product.variants.find(v => v.id === match.id) || null);
        }
    }, [applyVariantSelection, parsedVariants, selectedSize, product.variants]);

    const handleSizeSelect = useCallback((size: string) => {
        if (!product.variants) return;
        // Try to match the new size with the currently selected color first
        const match =
            parsedVariants.find(v => v.parsed.size === size && v.parsed.color === selectedColor) ||
            parsedVariants.find(v => v.parsed.size === size);
        if (match) {
            applyVariantSelection(product.variants.find(v => v.id === match.id) || null);
        }
    }, [applyVariantSelection, parsedVariants, selectedColor, product.variants]);

    const handleImageSelect = useCallback((imageUrl: string) => {
        setActiveImage(imageUrl);

        if (!isPhysical || !product.variants?.length) return;

        // Keep size/color in sync when selecting a variant image thumbnail.
        const variantsForImage = parsedVariants.filter(v => v.image === imageUrl);
        if (variantsForImage.length === 0) return;

        const match =
            variantsForImage.find(v => v.parsed.size === selectedSize && (!selectedColor || v.parsed.color === selectedColor)) ||
            variantsForImage.find(v => v.parsed.size === selectedSize) ||
            variantsForImage.find(v => v.parsed.color === selectedColor) ||
            variantsForImage[0];

        if (!match || selectedVariant?.id === match.id) return;
        applyVariantSelection(product.variants.find(v => v.id === match.id) || null);
    }, [applyVariantSelection, isPhysical, parsedVariants, product.variants, selectedColor, selectedSize, selectedVariant?.id]);

    /* ── Image Gallery ── */
    const galleryImages = useMemo(() => {
        const images: string[] = [];
        const seen = new Set<string>();

        if (product.image) {
            images.push(product.image);
            seen.add(product.image);
        }

        product.variants?.forEach(v => {
            if (v.image && !seen.has(v.image)) {
                images.push(v.image);
                seen.add(v.image);
            }
        });

        return images;
    }, [product]);

    /* ── Cart logic (preserved from original) ── */
    const isInCart = cart.some(item => {
        if (isPhysical) {
            return item.metadata?.variant_id === String(selectedVariant?.id);
        }
        return item.id === product.id;
    });

    const handleAddToCart = () => {
        if (!isPhysical) {
            addToCart(product);
            return;
        }

        if (!selectedVariant) return;

        // Block if size is required but not selected
        if (sizes.length > 0 && !selectedSize) return;

        const resolvedCatalogVariantId = selectedVariant.catalog_variant_id ?? selectedVariant.id;

        const cartProduct: Product = {
            ...product,
            id: `pf_${product.metadata?.printful_id}_${selectedVariant.id}`,
            amount: parseFloat(selectedVariant.retail_price),
            image: selectedVariant.image || product.image,
            metadata: {
                ...product.metadata,
                variant_id: String(selectedVariant.id),
                catalog_variant_id: String(resolvedCatalogVariantId),
                variant_name: selectedVariant.name,
            },
            selectedVariantId: String(selectedVariant.id),
            selectedCatalogVariantId: String(resolvedCatalogVariantId),
        };
        addToCart(cartProduct);
    };

    /* ── Pricing ── */
    const displayPrice = isPhysical && selectedVariant
        ? parseFloat(selectedVariant.retail_price)
        : product.amount;

    /* ── Descriptions ── */
    const DETAILED_DESCRIPTIONS: Record<string, string> = {
        'VOID_TEXTURES_01': "A collection of high-fidelity audio artifacts harvested from corrupted data streams. These textures have been processed through analog distortion circuits and granular synthesis engines to create a sense of vast, empty space. ideal for cinematic sound design, dark ambient, and industrial techno. Expect heavy sub-bass drones, metallic scrapes, and digital interference patterns.",
        'BROKEN_DRUMS_X': "Rhythmic glitches and decimated percussion loops. Each sample has been rigorously tested for maximum impact and textural grit. This pack contains hard-hitting kicks, snapping snares, and erratic hi-hat patterns that defy standard quantization. Perfect for adding a chaotic, human feel to mechanical beats.",
        'NEURO_BASS_V2': "Twisted low-end frequencies and reese basslines designed to tear through the mix. Synthesized using advanced frequency modulation and wave-shaping techniques. These sounds are essential for drum and bass, neurofunk, and heavy dubstep production. Warning: High levels of spectral saturation.",
        'CORTEX_LOOPS': "Brain-melting synth loops and arpeggios recorded from a custom modular eurorack system. These sequences are generative and evolving, providing endless inspiration for IDM and experimental electronic music. Contains complex polyrhythms and microtonal melodies.",
        'GLITCH_ARTIFACTS': "Pure digital error. Datamosh sounds, signal interference, and buffer underruns. These samples capture the beauty of technology failing. Use them as rhythmic elements, FX transitions, or to add a layer of digital decay to your tracks.",
        'ACID_WASH_303': "Squelchy, resonant acid lines directly from a modified TB-303. Recorded through a chain of vintage distortion pedals and tape delays. These loops scream with analog warmth and aggressive filter modulation. The definitive sound of underground rave culture.",
        'DISTORTION_UNIT': "A comprehensive library of impulse responses and heavy distortion FX chains. Run your clean sounds through these processors to add grit, warmth, and destruction. Includes bit-crushing, tube saturation, and wave-folding effects.",
        'VOCAL_CHOP_SYSTEM': "Futuristic vocal aesthetics for the modern producer. Processed vocal chops, granular synthesis textures, and formant-shifted phrases. These samples have been deconstructed and reassembled to create an alien, cybernetic vocal instrument.",
        'AMBIENT_WASH_IV': "Lush, evolving pads and drones that drift through the stereo field. Perfect for creating immersive backgrounds, intros, and breakdowns. These sounds are rich in harmonic content and slow modulation, evoking a sense of deep space and tranquility."
    };

    const extendedDescription = DETAILED_DESCRIPTIONS[product.name] ||
        (isPhysical
            ? "Exclusive physical merchandise. Professionally printed on demand and shipped globally using high-quality materials. Optimized for durability and comfort."
            : "This asset pack contains high-fidelity audio recordings processed via proprietary analog and digital chains. Optimal for advanced sound design, cinematic scoring, and experimental electronic music production. All files are rendered at 24-bit / 48kHz for maximum headroom and dynamic range. Expect minimal noise floor and maximum signal integrity.");

    /* ── Flags ── */
    const needsSizeSelection = isPhysical && sizes.length > 0 && !selectedSize;

    /* ── Animation ── */
    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex-1 w-full px-4 md:px-7 lg:px-8 py-6 md:py-10"
        >
            {/* ── Breadcrumb ── */}
            <motion.nav
                variants={itemVariants}
                className="flex items-center gap-2 font-mono text-[11px] text-muted uppercase tracking-[0.14em] mb-8"
            >
                <Link href="/" className="hover:text-primary transition-colors">store</Link>
                <span className="text-border/60">/</span>
                <span className="text-foreground/60 truncate max-w-[200px] md:max-w-none">{product.name}</span>
            </motion.nav>

            {/* ── Main 2-Column Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20">

                {/* ════════ LEFT: Image Gallery ════════ */}
                <motion.div variants={itemVariants} className="flex gap-3 md:gap-4">
                    {/* Thumbnail Strip */}
                    {galleryImages.length > 1 && (
                        <div className="hidden md:flex flex-col gap-2 w-[68px] shrink-0">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleImageSelect(img)}
                                    className={`relative aspect-square w-full overflow-hidden rounded border transition-all duration-200
                                        ${activeImage === img
                                            ? 'border-primary/50 ring-1 ring-primary/20'
                                            : 'border-border/40 hover:border-primary/30'
                                        }`}
                                >
                                    <Image
                                        alt={`${product.name} view ${i + 1}`}
                                        src={img}
                                        fill
                                        className="object-contain p-1"
                                        sizes="68px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="relative flex-1 aspect-square overflow-hidden rounded border border-border/30 bg-foreground/[0.03] dark:bg-white/[0.03]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    alt={product.name}
                                    src={activeImage || 'https://via.placeholder.com/1000'}
                                    fill
                                    className="object-contain p-6 md:p-10"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 z-10 opacity-[0.02] pointer-events-none">
                            <MatrixSpace isVisible={true} />
                        </div>
                    </div>
                </motion.div>

                {/* ════════ RIGHT: Product Details ════════ */}
                <motion.div variants={containerVariants} className="space-y-5 lg:space-y-6">

                    {/* Category Tag */}
                    <motion.p variants={itemVariants} className="font-mono text-[10px] text-muted uppercase tracking-[0.2em]">
                        {isPhysical ? 'physical merch' : (product.metadata?.category || 'sample pack')}
                    </motion.p>

                    {/* Product Name */}
                    <motion.h1 variants={itemVariants} className="heading-h1 text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl !leading-[0.92]">
                        {product.name}
                    </motion.h1>

                    {/* Price */}
                    <motion.div variants={itemVariants} className="flex items-baseline gap-3 pt-1">
                        <span className="text-2xl md:text-3xl font-semibold text-foreground font-mono tracking-tight">
                            {product.amount === 0 ? 'Free' : `$${displayPrice.toFixed(2)}`}
                        </span>
                        <span className="font-mono text-[10px] text-muted uppercase tracking-[0.14em]">
                            {isPhysical ? 'usd' : 'lifetime license'}
                        </span>
                    </motion.div>

                    {/* Description */}
                    <motion.p variants={itemVariants} className="text-sm text-muted leading-relaxed max-w-prose">
                        {product.description}
                    </motion.p>

                    {/* ── Divider ── */}
                    <motion.div variants={itemVariants} className="border-t border-border/30" />

                    {/* ── Color Selector ── */}
                    {isPhysical && colors.length > 0 && (
                        <motion.div variants={itemVariants} className="space-y-3">
                            <p className="font-mono text-[11px] text-foreground/70 uppercase tracking-[0.14em]">
                                Color: <span className="text-foreground font-medium">{selectedColor || 'select'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => handleColorSelect(c)}
                                        className={`h-[38px] px-5 border transition-all font-mono text-[10px] uppercase tracking-[0.14em] rounded-md
                                            ${selectedColor === c
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border/50 bg-background/40 text-muted hover:border-primary/30 hover:text-foreground'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Size Selector ── */}
                    {isPhysical && sizes.length > 0 && (
                        <motion.div variants={itemVariants} className="space-y-3">
                            <p className="font-mono text-[11px] text-foreground/70 uppercase tracking-[0.14em]">
                                Size: <span className="text-foreground font-medium">{selectedSize || 'select'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => {
                                    // Check availability for the currently selected color
                                    const isAvailable = !selectedColor || parsedVariants.some(
                                        v => v.parsed.size === size && v.parsed.color === selectedColor
                                    );
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => isAvailable && handleSizeSelect(size)}
                                            disabled={!isAvailable}
                                            className={`h-[38px] min-w-[48px] px-4 border transition-all font-mono text-[11px] uppercase tracking-[0.1em] rounded-md
                                                ${!isAvailable
                                                    ? 'border-border/20 text-muted/25 cursor-not-allowed line-through'
                                                    : selectedSize === size
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border/50 bg-background/40 text-foreground/80 hover:border-primary/30'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Generic Variant Selector (digital or unparseable) ── */}
                    {!isPhysical && product.variants && product.variants.length > 0 && (
                        <motion.div variants={itemVariants} className="space-y-3">
                            <p className="font-mono text-[11px] text-foreground/70 uppercase tracking-[0.14em]">
                                Variant
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => applyVariantSelection(v)}
                                        className={`h-[38px] px-5 border transition-all font-mono text-[10px] uppercase tracking-[0.14em] rounded-md
                                            ${selectedVariant?.id === v.id
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border/50 bg-background/40 text-muted hover:border-primary/30 hover:text-foreground'
                                            }`}
                                    >
                                        {v.name.split(' - ').pop()}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {/* Quantity + CTA Row */}
                    <motion.div variants={itemVariants} className="space-y-2 pt-1">
                        <div className="flex items-stretch gap-2.5 md:gap-3">
                            {/* Quantity Picker */}
                            <div className="flex items-center border border-border/50 bg-background/35 rounded-md h-[44px] shrink-0">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors rounded-l-md"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={13} />
                                </button>
                                <span className="w-9 text-center font-mono text-[13px] text-foreground select-none border-x border-border/30">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors rounded-r-md"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>

                            {/* Primary CTA */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isInCart || needsSizeSelection}
                                className={`flex-1 h-[44px] px-4 flex items-center justify-center gap-2.5 font-mono text-[9px] md:text-[10px] font-bold tracking-[0.14em] uppercase transition-all duration-300 rounded-md border
                                    ${isInCart
                                        ? 'bg-primary/8 border-primary/30 text-primary/70 cursor-default'
                                        : needsSizeSelection
                                            ? 'bg-foreground/[0.03] border-border/40 text-muted/80 cursor-default'
                                            : 'bg-primary text-primary-foreground border-primary/90 hover:brightness-105 active:scale-[0.995] shadow-[0_3px_14px_rgba(var(--primary-rgb),0.18)]'
                                    }`}
                            >
                                <span>
                                    {isInCart
                                        ? 'added'
                                        : needsSizeSelection
                                            ? 'select size'
                                            : 'add to cart'}
                                </span>
                                {!isInCart && !needsSizeSelection && <span className="opacity-60 text-xs">-&gt;</span>}
                            </button>
                        </div>

                        <p className="font-mono text-[10px] text-muted/70 uppercase tracking-[0.12em]">
                            {isPhysical ? 'shipping + tax calculated at checkout' : 'instant delivery after payment'}
                        </p>
                    </motion.div>


                    {/* Audio Preview (Digital Products) */}
                    {audioPreviewUrl && (
                        <motion.div variants={itemVariants}>
                            <button
                                onClick={playPreview}
                                className={`w-full h-[44px] flex items-center justify-center gap-3 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 rounded-md border
                                    ${isActivePreview && isPlaying
                                        ? 'bg-primary/15 text-primary border-primary/40'
                                        : 'border-border/50 bg-background/40 text-foreground/85 hover:border-primary/40 hover:text-primary'
                                    }`}
                            >
                                {isActivePreview && isPlaying ? (
                                    <IconPlayerPauseFilled size={13} />
                                ) : (
                                    <IconPlayerPlayFilled size={13} />
                                )}
                                <span>{isActivePreview && isPlaying ? 'playing' : 'play audio demo'}</span>
                            </button>
                        </motion.div>
                    )}

                    {/* ── Divider ── */}
                    <motion.div variants={itemVariants} className="border-t border-border/30" />


                    {/* Full Description */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <p className="font-mono text-[11px] text-foreground/70 uppercase tracking-[0.14em]">
                            description
                        </p>
                        <p className="text-sm text-muted/80 leading-relaxed max-w-prose">
                            {extendedDescription}
                        </p>

                        {/* Technical Metadata (below the extended description) */}
                        {!isPhysical && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-border/20">
                                {[
                                    { k: 'format', v: product.metadata?.format || 'WAV' },
                                    { k: 'size', v: product.metadata?.size || '--' },
                                    { k: 'depth', v: '24-BIT / 96' },
                                    { k: 'license', v: 'LIFETIME' },
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-primary/30 uppercase tracking-wider font-mono">{spec.k}</span>
                                        <span className="text-[11px] text-foreground/60 uppercase font-mono">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isPhysical && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-t border-border/20">
                                {[
                                    { k: 'type', v: 'print on demand' },
                                    { k: 'options', v: `${product.variants?.length || 0} variants` },
                                    { k: 'source', v: 'printful' },
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-primary/30 uppercase tracking-wider font-mono">{spec.k}</span>
                                        <span className="text-[11px] text-foreground/60 uppercase font-mono">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Trust / Info Badges */}
                    <motion.div variants={itemVariants} className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-border/30">
                        {isPhysical ? (
                            <>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    worldwide shipping
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    tracking included
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    secure checkout
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    instant download
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    {product.metadata?.format || 'WAV'} format
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase tracking-wider">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    lifetime license
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
