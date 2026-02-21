'use client';

import { useCart } from './CartProvider';
import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconLock, IconPlus, IconShoppingCart, IconSparkles, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from './CartProvider';
import OneShotPlayer from './OneShotPlayer';

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
    const router = useRouter();
    const dismissButtonClass = 'rounded-none transition-colors cursor-pointer text-muted hover:text-foreground hover:bg-foreground/5';

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
            <div className="border-t border-border/70 pt-3">
                <div className="flex items-center justify-between gap-3 mb-2 px-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">one-shots</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground/70 truncate max-w-[60%] text-right">
                        {product?.name}
                    </span>
                </div>

                <div>
                    {oneShots.map((url, index) => (
                        <div key={`${product?.id || 'preview'}-${index}`} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-b-0">
                            <span className="w-5 flex-shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-muted/80">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="w-full h-[32px]">
                                <OneShotPlayer audioUrl={url} isActive={isCartOpen} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderUpsellSection = () => (
        <section className="border-t border-border/70 pt-4">
            <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="jacquard-24-regular text-lg leading-none text-foreground">upsell picks</h3>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">new merch</span>
            </div>

            {upsellLoading ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80 py-2">loading offers...</p>
            ) : upsellCandidates.length === 0 ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80 py-2">more drops landing soon</p>
            ) : (
                <div>
                    {upsellCandidates.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-b-0">
                            <div className="w-10 h-10 border border-border overflow-hidden bg-background/70 flex-shrink-0 rounded-none">
                                {item.image ? (
                                    <NextImage src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                        <IconSparkles size={14} stroke={2} />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted mt-0.5">
                                    {formatPrice(item.amount || 0, item.currency || 'usd')}
                                </p>
                            </div>

                            <button
                                onClick={() => addToCart(item)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-none border border-border text-muted hover:text-foreground hover:bg-foreground/8 transition-colors cursor-pointer flex-shrink-0"
                                aria-label={`Add ${item.name} to cart`}
                                title="Add to cart"
                            >
                                <IconPlus size={14} stroke={2.2} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
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

                        <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="py-6 space-y-5">
                                    <div className="border-b border-border/70 pb-5">
                                        <div className="flex items-center gap-3 py-1">
                                            <IconShoppingCart size={18} stroke={1.9} className="text-foreground/65" aria-hidden />
                                            <p className="jacquard-24-regular text-xl leading-none text-foreground">cart empty</p>
                                        </div>
                                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mt-1">
                                            ready to load new drops
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            <button
                                                onClick={() => goTo('/#catalog')}
                                                className="w-full h-[42px] rounded-none bg-primary text-primary-foreground font-semibold text-[13px] transition-all duration-150 hover:brightness-110 cursor-pointer inline-flex items-center justify-center gap-2"
                                            >
                                                Browse catalog
                                                <IconArrowRight size={14} stroke={2.2} />
                                            </button>

                                            <button
                                                onClick={() => goTo('/')}
                                                className="w-full h-[40px] rounded-none border border-border bg-transparent text-foreground/85 font-medium text-[12px] transition-colors duration-150 hover:bg-foreground/5 cursor-pointer inline-flex items-center justify-center gap-2"
                                            >
                                                <IconSparkles size={14} stroke={2} />
                                                Check new merch
                                            </button>
                                        </div>

                                        <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.18em] text-muted/85 text-center">
                                            Instant delivery / lifetime access
                                        </p>
                                    </div>

                                    {renderUpsellSection()}
                                    {renderOneShotPreview(emptyCartPreviewProduct, emptyCartOneShots)}
                                </div>
                            ) : (
                                <div>
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
                                                    <div className="w-[56px] h-[56px] flex-shrink-0 rounded-none overflow-hidden flex items-center justify-center border border-border bg-background/55">
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

                                    <div className="pt-5">
                                        {renderUpsellSection()}
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
                                    className="w-full h-[44px] rounded-none font-medium text-[15px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-primary text-primary-foreground hover:brightness-110 shadow-[0_4px_12px_rgba(15,23,42,0.16)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
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
