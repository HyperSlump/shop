'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconWaveSine } from '@tabler/icons-react';

import type { Product } from './CartProvider';
import { usePreviewPlayer } from './PreviewPlayerProvider';

interface ProductCardProps {
    product: Product;
    isInCart: boolean;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, isInCart, onAddToCart }: ProductCardProps) {
    const { playTrack, isTrackActive, isPlaying, isOpen } = usePreviewPlayer();

    const audioPreviewUrl = typeof product.metadata?.audio_preview === 'string' ? product.metadata.audio_preview : '';
    const oneShotCount = typeof product.metadata?.count === 'string' ? product.metadata.count : '140';
    const formatLabel = typeof product.metadata?.format === 'string' ? product.metadata.format.toUpperCase() : 'WAV';
    const href = `/product/${product.id}`;
    const isActivePreview = isOpen && isTrackActive(product.id);

    const addToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onAddToCart(product);
    };

    const playPreview = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!audioPreviewUrl) return;

        playTrack({
            id: product.id,
            title: product.name,
            subtitle: `${formatLabel} / ${oneShotCount} one-shots`,
            image: product.image,
            audioUrl: audioPreviewUrl,
        });
    };

    return (
        <article className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(120% 90% at 8% 0%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 58%)'
                }}
            />

            <div className="relative">
                <Link href={href} className="relative block">
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60 px-3 pb-3 pt-3">
                        <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-2">
                            <span className="inline-flex h-6 items-center rounded-full border border-border/70 bg-background/70 px-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                                instant download
                            </span>
                            <span className="inline-flex h-6 items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                {product.amount === 0 ? 'free' : `$${product.amount}`}
                            </span>
                        </div>

                        <div className="absolute inset-3 rounded-lg border border-border/65 bg-background/45" />
                        <div className="relative h-full w-full p-3">
                            <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                                <Image
                                    alt={product.name}
                                    className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.34)]"
                                    src={product.image || 'https://via.placeholder.com/500'}
                                    fill
                                    sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 31vw"
                                />
                            </div>
                        </div>
                    </div>
                </Link>

                {audioPreviewUrl ? (
                    <button
                        type="button"
                        onClick={playPreview}
                        className={`absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/80 bg-card/88 px-4 py-2.5 backdrop-blur-md transition-all duration-200 ${isActivePreview
                            ? 'opacity-100 translate-y-0 text-primary shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
                            : 'pointer-events-none opacity-0 translate-y-2 text-foreground/90 shadow-[0_8px_24px_rgba(0,0,0,0.25)] group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0'
                            }`}
                        aria-label={`${isActivePreview && isPlaying ? 'Pause' : 'Play'} preview for ${product.name}`}
                    >
                        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                            {isActivePreview && isPlaying ? (
                                <IconPlayerPauseFilled size={12} />
                            ) : (
                                <IconPlayerPlayFilled size={12} />
                            )}
                            {isActivePreview && isPlaying ? 'playing' : 'preview'}
                        </span>
                    </button>
                ) : (
                    <div className="pointer-events-none absolute bottom-4 left-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                        <IconWaveSine size={12} />
                        no preview
                    </div>
                )}
            </div>

            <div className="relative space-y-3 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h3
                            className="heading-h1 jacquard-24-regular text-[2rem] leading-[0.92] text-foreground lowercase"
                            style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                        >
                            <Link href={href} className="transition-colors duration-150 hover:text-primary">
                                {product.name}
                            </Link>
                        </h3>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[1.1rem] font-semibold leading-none text-primary">
                            {product.amount === 0 ? 'free' : `$${product.amount}`}
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                            lifetime license
                        </p>
                    </div>
                </div>

                <p className="line-clamp-2 text-sm leading-relaxed text-muted/95">
                    {product.description || 'High-impact one-shot kit for fast production and instant deployment.'}
                </p>

                <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex h-6 items-center rounded-full border border-border bg-background/45 px-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                        {formatLabel}
                    </span>
                    <span className="inline-flex h-6 items-center rounded-full border border-border bg-background/45 px-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                        {oneShotCount} one-shots
                    </span>
                    <span className="inline-flex h-6 items-center rounded-full border border-border bg-background/45 px-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                        secure checkout
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Link
                        href={href}
                        className="inline-flex h-[42px] flex-1 items-center justify-center rounded-md border border-border bg-background/45 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/85 transition-colors hover:border-primary/35 hover:text-primary"
                    >
                        view details
                    </Link>
                    <button
                        type="button"
                        onClick={addToCart}
                        disabled={isInCart}
                        className={`inline-flex h-[42px] flex-[1.25] items-center justify-center rounded-md border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-all ${isInCart
                            ? 'cursor-default border-primary/25 bg-primary/10 text-primary/75'
                            : 'border-primary bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.99]'
                            }`}
                    >
                        {isInCart ? 'added' : 'add to cart'}
                    </button>
                </div>
            </div>
        </article>
    );
}
