'use client';

import { useCart } from './CartProvider';
import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconChevronDown, IconLock, IconPlus, IconShoppingCart, IconSparkles, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from './CartProvider';
import OneShotPlayer from './OneShotPlayer';
import GrainedNoise from './GrainedNoise';

function formatPrice(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            maximumFractionDigits: 0
        }).format(amount);
    } catch {
        return `$${Math.round(amount)}`;
    }
}

function getOneShots(metadata?: Record<string, string>) {
    return [
        metadata?.sample_1,
        metadata?.sample_2,
        metadata?.sample_3,
        metadata?.sample_4,
    ].filter((value): value is string => typeof value === 'string' && value.length > 0);
}

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, addToCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);
    const [upsellLoading, setUpsellLoading] = useState(false);
    const [oneShotsOpen, setOneShotsOpen] = useState(false);
    const [upsellsOpen, setUpsellsOpen] = useState(false);
    const router = useRouter();
    const dismissButtonClass = 'rounded-xs transition-colors cursor-pointer text-muted hover:text-foreground hover:bg-foreground/5';

    const handleCheckout = async () => {
        setLoading(true);
        toggleCart();
        router.push('/checkout');
        setLoading(false);
    };

    const goTo = (href: string) => {
        toggleCart();
        router.push(href);
    };

    useEffect(() => {
        if (!isCartOpen) return;
        if (upsellProducts.length > 0) return;

        const controller = new AbortController();
        const loadUpsells = async () => {
            setUpsellLoading(true);
            try {
                const res = await fetch('/api/products', { signal: controller.signal });
                if (!res.ok) return;
                const data: unknown = await res.json();
                if (!Array.isArray(data)) return;

                const parsed = data.filter((item): item is Product => {
                    if (typeof item !== 'object' || item === null) return false;
                    const candidate = item as Record<string, unknown>;
                    return (
                        typeof candidate.id === 'string' &&
                        typeof candidate.productId === 'string' &&
                        typeof candidate.name === 'string' &&
                        typeof candidate.currency === 'string' &&
                        typeof candidate.amount === 'number'
                    );
                });
                setUpsellProducts(parsed);
            } catch (error) {
                if ((error as { name?: string }).name !== 'AbortError') {
                    console.error('Failed to load upsell products:', error);
                }
            } finally {
                setUpsellLoading(false);
            }
        };

        loadUpsells();
        return () => controller.abort();
    }, [isCartOpen, upsellProducts.length]);

    const upsellCandidates = upsellProducts
        .filter((item) => !cart.some((cartItem) => cartItem.id === item.id))
        .slice(0, cart.length === 0 ? 3 : 2);
    const footerOneShotProduct = cart.find((item) => getOneShots(item.metadata).length > 0) || null;
    const footerOneShots = footerOneShotProduct ? getOneShots(footerOneShotProduct.metadata).slice(0, 4) : [];
    const emptyCartPreviewProduct = [...upsellCandidates, ...upsellProducts].find((item) => getOneShots(item.metadata).length > 0) || null;
    const emptyCartOneShots = emptyCartPreviewProduct ? getOneShots(emptyCartPreviewProduct.metadata).slice(0, 4) : [];

    const renderOneShotPreview = (product: Product | null, oneShots: string[]) => {
        if (oneShots.length === 0) return null;

        return (
            <div className="border-t border-border/70 pt-4 mt-2">
                <button
                    onClick={() => setOneShotsOpen(!oneShotsOpen)}
                    className="w-full flex items-center justify-between gap-3 px-1 group cursor-pointer transition-all duration-200"
                >
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="jacquard-24-regular text-lg leading-none text-foreground group-hover:text-primary transition-colors">
                                reveal previews
                            </h3>
                            <IconChevronDown
                                size={12}
                                stroke={2.5}
                                className={`text-muted transition-transform duration-300 ${oneShotsOpen ? '' : 'rotate-180'}`}
                            />
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60 group-hover:text-muted transition-colors">
                            one-shot audio library
                        </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground/70 truncate max-w-[140px]">
                            {product?.name}
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-primary/80 animate-pulse mt-0.5">
                            {oneShotsOpen ? 'listening' : 'click to hear'}
                        </span>
                    </div>
                </button>

                <AnimatePresence>
                    {oneShotsOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="py-4 space-y-1">
                                {oneShots.map((url, index) => (
                                    <div key={`${product?.id || 'preview'}-${index}`} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-b-0">
                                        <span className="w-5 flex-shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-muted/80">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="w-full h-[32px]">
                                            <OneShotPlayer audioUrl={url} isActive={isCartOpen && oneShotsOpen} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderUpsellSection = () => (
        <section className="pt-5 pb-4 mb-2 border-b border-border/70">
            <button
                onClick={() => setUpsellsOpen(!upsellsOpen)}
                className="w-full flex items-center justify-between gap-3 px-1 group cursor-pointer transition-all duration-200"
            >
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <h3 className="jacquard-24-regular text-lg leading-none text-foreground group-hover:text-primary transition-colors">
                            expand collection
                        </h3>
                        <IconChevronDown
                            size={12}
                            stroke={2.5}
                            className={`text-muted transition-transform duration-300 ${upsellsOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60 group-hover:text-muted transition-colors">
                        curated industrial drops
                    </span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground/70">
                        {upsellCandidates.length} potential picks
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-primary/80 animate-pulse mt-0.5">
                        {upsellsOpen ? 'viewing' : 'view offers'}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {upsellsOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 pb-2">
                            {upsellLoading ? (
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80 py-2 italic animate-pulse">Scanning matrix for deals...</p>
                            ) : upsellCandidates.length === 0 ? (
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80 py-2">No active drops available</p>
                            ) : (
                                <div className="space-y-1">
                                    {upsellCandidates.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-b-0 hover:bg-foreground/[0.02] transition-colors rounded-sm px-1">
                                            <div className="w-12 h-12 border border-border/80 overflow-hidden bg-background/70 flex-shrink-0 rounded-sm shadow-sm relative group/img">
                                                {item.image ? (
                                                    <NextImage src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover grayscale-[0.5] group-hover/img:grayscale-0 transition-all duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                                        <IconSparkles size={16} stroke={2} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="min-w-0 flex-1 pl-1">
                                                <p className="text-[13px] font-medium text-foreground truncate">{item.name}</p>
                                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary mt-1">
                                                    {formatPrice(item.amount || 0, item.currency || 'usd')}
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item);
                                                }}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border text-muted hover:text-foreground hover:bg-primary hover:border-primary transition-all duration-200 cursor-pointer flex-shrink-0 group/add"
                                                aria-label={`Add ${item.name} to cart`}
                                                title="Add to cart"
                                            >
                                                <IconPlus size={16} stroke={2.5} className="group-hover/add:rotate-90 transition-transform duration-300" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        data-lenis-prevent
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[4px]"
                        onClick={toggleCart}
                    />

                    <motion.aside
                        data-lenis-prevent
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                        className="drawer-surface fixed inset-y-0 right-0 h-full w-full md:w-[420px] z-[150] flex flex-col overflow-hidden border-l border-border shadow-2xl"
                    >
                        <GrainedNoise animate={false} />
                        <div className="flex-shrink-0 px-6 py-5 border-b border-border/70 backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2
                                        className="brand-logo-jacquard text-[2.15rem] leading-none text-foreground"
                                        style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                                    >
                                        your cart
                                    </h2>
                                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                                        instant access queue
                                    </p>
                                    {cart.length > 0 && (
                                        <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted/85">
                                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={toggleCart}
                                    className={`mt-1 p-1.5 ${dismissButtonClass}`}
                                >
                                    <IconX size={18} stroke={2} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 no-scrollbar flex flex-col">
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-full max-w-[300px] space-y-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-sm border border-border/50 flex items-center justify-center mb-6 bg-foreground/[0.02]">
                                                <IconShoppingCart size={28} stroke={1.2} className="text-muted/60" aria-hidden />
                                            </div>
                                            <h2 className="jacquard-24-regular text-2xl leading-none text-foreground">cart empty</h2>
                                            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted mt-2">
                                                matrix sequence: void
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-4">
                                            <button
                                                onClick={() => goTo('/#catalog')}
                                                className="w-full h-[46px] rounded-sm bg-primary text-primary-foreground font-semibold text-[13px] transition-all duration-150 hover:brightness-110 cursor-pointer inline-flex items-center justify-center gap-2 group"
                                            >
                                                Browse catalog
                                                <IconArrowRight size={14} stroke={2.2} className="group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <button
                                                onClick={() => goTo('/')}
                                                className="w-full h-[44px] rounded-sm border border-border bg-transparent text-foreground/85 font-medium text-[12px] transition-colors duration-150 hover:bg-foreground/5 cursor-pointer inline-flex items-center justify-center gap-2"
                                            >
                                                <IconSparkles size={14} stroke={2} />
                                                New merch drops
                                            </button>
                                        </div>

                                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/50 pt-4">
                                            Instant delivery / lifetime access
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6">
                                    <div>
                                        <div className="pb-6">
                                            {renderUpsellSection()}
                                        </div>
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {cart.map((item) => (
                                                <div key={item.id} className="relative overflow-hidden">
                                                    <motion.div
                                                        layout
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: 10, y: -2, scale: 0.988, filter: 'blur(1px)' }}
                                                        transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
                                                        className="relative py-5 flex items-center gap-3 border-b border-border/70 bg-transparent transition-colors"
                                                    >
                                                        <div className="w-[56px] h-[56px] flex-shrink-0 rounded-sm overflow-hidden flex items-center justify-center border border-border bg-background/55">
                                                            <NextImage
                                                                src={item.image || 'https://via.placeholder.com/100'}
                                                                alt={item.name}
                                                                width={56}
                                                                height={56}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium leading-snug text-foreground">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs mt-0.5 text-muted">
                                                                Digital item / Qty 1
                                                            </p>
                                                        </div>

                                                        <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                                            ${(item.amount || 0).toFixed(2)}
                                                        </span>

                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            aria-label={`Remove ${item.name} from cart`}
                                                            className={`flex-shrink-0 inline-flex w-7 h-7 items-center justify-center ${dismissButtonClass}`}
                                                            title="Remove item"
                                                        >
                                                            <IconX size={13} stroke={2.25} />
                                                        </button>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="flex-shrink-0 px-6 py-5 border-t border-border/70">
                                <div className="mb-4">
                                    {renderOneShotPreview(footerOneShotProduct, footerOneShots)}
                                </div>

                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Subtotal</span>
                                        <span className="text-foreground">${(cartTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Shipping</span>
                                        <span className="text-muted">Calculated at checkout</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-4 border-t border-border/70">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-foreground">${(cartTotal || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                    className="w-full h-[44px] rounded-sm font-medium text-[15px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-primary text-primary-foreground hover:brightness-110 shadow-[0_4px_12px_rgba(15,23,42,0.16)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
                                >
                                    {loading ? 'Redirecting...' : 'Continue to checkout'}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted/65">
                                    <IconLock size={10} stroke={2.3} />
                                    <span>Secured by <strong className="font-semibold text-foreground">stripe</strong></span>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
