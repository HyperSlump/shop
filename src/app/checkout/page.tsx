'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart, type Product } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconChevronDown, IconLock } from '@tabler/icons-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    return isDark;
}

function stripeAppearance(isDark: boolean): Appearance {
    return {
        theme: (isDark ? 'night' : 'stripe'),
        variables: {
            colorPrimary: isDark ? '#D83A3D' : '#C86A83',
            colorBackground: isDark ? '#111416' : '#FFFFFF',
            colorText: isDark ? '#ECECEC' : '#121517',
            colorDanger: isDark ? '#F04A4D' : '#D83A3D',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            borderRadius: '10px',
            spacingUnit: '4px'
        },
        rules: {
            '.Input': {
                border: isDark ? '1px solid rgba(167,160,164,0.45)' : '1px solid #d7dbde',
                boxShadow: 'none',
                padding: '12px',
                fontSize: '14px',
                lineHeight: '20px',
                backgroundColor: isDark ? '#0B0D0E' : '#ffffff'
            },
            '.Input:focus': {
                border: isDark ? '1px solid #D83A3D' : '1px solid #C86A83',
                boxShadow: isDark ? '0 0 0 3px rgba(216,58,61,0.2)' : '0 0 0 3px rgba(200,106,131,0.16)'
            },
            '.Label': {
                fontWeight: '500',
                fontSize: '14px',
                marginBottom: '8px',
                color: isDark ? '#ECECEC' : '#121517'
            },
            '.Tab': {
                border: isDark ? '1px solid rgba(167,160,164,0.45)' : '1px solid #d7dbde',
                backgroundColor: isDark ? '#0B0D0E' : '#ffffff'
            },
            '.Tab--selected': {
                borderColor: isDark ? '#D83A3D' : '#C86A83',
                backgroundColor: isDark ? 'rgba(216,58,61,0.12)' : 'rgba(200,106,131,0.1)'
            }
        }
    };
}

export default function CheckoutPage() {
    const { cartTotal, cart } = useCart();
    const isDark = useTheme();

    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);

    const isFreeOrder = cartTotal === 0 && cart.length > 0;

    useEffect(() => {
        if (cartTotal > 0 && cart.length > 0) {
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart })
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error(`API ${res.status}`);
                    return res.json();
                })
                .then((d) => setClientSecret(d.clientSecret))
                .catch((e) => setError(e.message));
        }
    }, [cartTotal, cart]);

    if (cart.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center space-y-6 px-6">
                    <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted">Your cart is empty</p>
                    <h1 className="font-sans text-[1.75rem] font-semibold tracking-tight">Nothing here yet</h1>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-sans text-sm font-medium transition-colors hover:opacity-80 text-primary"
                    >
                        <IconArrowLeft size={14} stroke={2} />
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    const appearance = stripeAppearance(isDark);

    return (
        <div className="flow-page-surface min-h-screen flex flex-col bg-background text-foreground">

            <div className="flex-1 flex flex-col lg:flex-row">
                <div className="w-full lg:w-[44%] drawer-surface border-b lg:border-b-0 lg:border-r border-border">
                    <div className="flex flex-col w-full max-w-[500px] ml-auto px-8 lg:px-12 py-10 lg:py-12">
                        <div className="flex-shrink-0 mb-8">
                            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                                <IconArrowLeft size={14} stroke={2} className="text-muted group-hover:-translate-x-0.5 transition-transform" />
                                <span
                                    className="brand-logo-jacquard text-[2rem] leading-none tracking-tight text-foreground"
                                    style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                                >
                                    hyper$lump
                                </span>
                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                    Test
                                </span>
                            </Link>

                            <p className="font-sans text-[40px] font-semibold tracking-tight leading-none text-foreground">
                                ${cartTotal.toFixed(2)}
                            </p>
                        </div>

                        <div className="flex-shrink-0 space-y-4">
                            {cart.length > 0 && (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="w-[56px] h-[56px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-background/60">
                                        {cart[0].image ? (
                                            <img src={cart[0].image} alt={cart[0].name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-medium text-muted/70">01</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-snug text-foreground">{cart[0].name}</p>
                                            <p className="text-xs mt-0.5 text-muted">Qty 1</p>
                                        </div>
                                        <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                            ${(cart[0].amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {cart.length > 1 && (
                                <div>
                                    <button
                                        onClick={() => setProductsOpen(!productsOpen)}
                                        className="w-full flex items-center justify-between py-3 font-sans text-sm cursor-pointer group hover:opacity-80 transition-opacity border-t border-border"
                                    >
                                        <span className="font-medium text-muted">
                                            {productsOpen ? 'Hide items' : `Show ${cart.length - 1} more ${cart.length - 1 === 1 ? 'item' : 'items'}`}
                                        </span>
                                        <IconChevronDown
                                            size={14}
                                            stroke={2}
                                            className={`transition-transform duration-200 text-muted ${productsOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {productsOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div
                                                    data-lenis-prevent
                                                    className="max-h-[42vh] overflow-y-auto pb-4 pr-5 -mr-5 no-scrollbar"
                                                >
                                                    <div className="space-y-5 font-sans pt-2">
                                                        {cart.slice(1).map((item, i) => (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="w-[56px] h-[56px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-background/60">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs font-medium text-muted/70">
                                                                            {String(i + 2).padStart(2, '0')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium leading-snug text-foreground">{item.name}</p>
                                                                        <p className="text-xs mt-0.5 text-muted">Qty 1</p>
                                                                    </div>
                                                                    <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                                                        ${(item.amount || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0 font-sans">
                            <div className="pt-4 space-y-3 border-t border-border">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Subtotal</span>
                                    <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Shipping</span>
                                    <span className="text-foreground">$0.00</span>
                                </div>
                                <div className="flex justify-between text-sm pt-4 font-semibold border-t border-border">
                                    <span className="text-foreground">Total due today</span>
                                    <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 pt-8 flex items-center gap-1.5 font-sans text-xs text-muted">
                            <span>Powered by</span>
                            <span className="font-semibold text-foreground">stripe</span>
                            <span className="mx-1">|</span>
                            <a href="#" className="hover:underline">Terms</a>
                            <a href="#" className="hover:underline">Privacy</a>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-background">
                    <div className="w-full max-w-[520px] mr-auto px-5 lg:px-12 py-8 lg:py-12">
                        {isFreeOrder ? (
                            <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                                <FreeOrderPanel cart={cart} />
                            </div>
                        ) : clientSecret ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                                    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                        <CheckoutForm amount={cartTotal} isDark={isDark} />
                                    </Elements>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <div className="p-4 rounded-md bg-alert/10 border border-alert/30 text-alert font-medium">
                                <p className="font-sans text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin" />
                                <p className="font-sans text-sm text-muted">Loading checkout...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderSummary({ cart, total }: { cart: Product[]; total: number }) {
    return (
        <div className="font-sans">
            <div className="space-y-5">
                {cart.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="w-[64px] h-[64px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-background/60">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-medium text-muted/70">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-snug text-foreground">{item.name}</p>
                                <p className="text-xs mt-0.5 text-muted">Qty 1</p>
                            </div>
                            <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                ${(item.amount || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 space-y-3 border-t border-border">
                <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="text-foreground">$0.00</span>
                </div>
                <div className="flex justify-between text-sm pt-4 font-semibold border-t border-border">
                    <span className="text-foreground">Total due today</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

function FreeOrderPanel({ cart }: { cart: Product[] }) {
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);

        localStorage.setItem('hyperslump-download-email', email);
        localStorage.setItem('hyperslump-download-newsletter', newsletter ? 'yes' : 'no');
        localStorage.setItem('hyperslump-download-items', JSON.stringify(
            cart.map(item => ({ id: item.id, name: item.name, image: item.image }))
        ));

        await new Promise(r => setTimeout(r, 400));
        router.push('/downloads');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-sans">
            <h2 className="text-lg font-semibold mb-1 text-foreground">
                Complete your order
            </h2>
            <p className="text-sm mb-8 text-muted">
                Enter your email address to receive your order.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-3 text-foreground">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[44px] px-3 rounded-md text-sm outline-none transition-all duration-150 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm"
                    />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                        <input
                            type="checkbox"
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-[18px] h-[18px] rounded-sm border border-border transition-all duration-150 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary">
                            {newsletter && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-foreground">
                            Keep me updated
                        </span>
                        <p className="text-xs mt-0.5 text-muted">
                            Get notified about new sample packs, exclusive drops, and producer tips.
                        </p>
                    </div>
                </label>

                <button
                    type="submit"
                    disabled={submitting || !email}
                    className="group relative w-full h-[48px] rounded-md font-medium text-[15px] transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                         bg-primary text-primary-foreground
                         shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.24)]
                         hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_14px_rgba(0,0,0,0.34)]
                         hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                            Preparing...
                        </span>
                    ) : (
                        'Complete order'
                    )}
                </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted">
                <IconLock size={10} stroke={2.3} />
                <span>Your information is secure</span>
            </div>
        </motion.div>
    );
}
