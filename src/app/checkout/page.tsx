'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─────────────────────────────────────────────
   STRIPE APPEARANCE
   ───────────────────────────────────────────── */
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

function stripeAppearance(isDark: boolean) {
    return {
        theme: (isDark ? 'night' : 'stripe') as 'night' | 'stripe',
        variables: {
            colorPrimary: '#635BFF',
            colorBackground: isDark ? '#09090B' : '#FFFFFF',
            colorText: isDark ? '#F8FAFC' : '#0F172A',
            colorDanger: '#EF4444',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            borderRadius: '6px',
            spacingUnit: '4px',
        },
        rules: {
            '.Input': {
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)',
                boxShadow: 'none',
                padding: '12px',
                fontSize: '14px',
                lineHeight: '20px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
            },
            '.Input:focus': {
                border: '1px solid #635BFF',
                boxShadow: '0 0 0 3px rgba(99,91,255,0.1)',
            },
            '.Label': {
                fontWeight: '500',
                fontSize: '14px',
                marginBottom: '8px',
                color: isDark ? '#F8FAFC' : '#0F172A',
            },
            '.Tab': {
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
            },
            '.Tab--selected': {
                borderColor: '#635BFF',
                backgroundColor: isDark ? 'rgba(99,91,255,0.1)' : '#f0fdf4',
            },
        },
    };
}

/* ═════════════════════════════════════════════
   MAIN CHECKOUT PAGE
   ═════════════════════════════════════════════ */
export default function CheckoutPage() {
    const { cartTotal, cart } = useCart();
    const isDark = useTheme();

    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);

    const isFreeOrder = cartTotal === 0 && cart.length > 0;

    // Fetch payment intent
    useEffect(() => {
        if (cartTotal > 0 && cart.length > 0) {
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error(`API ${res.status}`);
                    return res.json();
                })
                .then((d) => setClientSecret(d.clientSecret))
                .catch((e) => setError(e.message));
        }
    }, [cartTotal, cart]);

    /* ── Empty cart ── */
    if (cart.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center space-y-6">
                    <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Your cart is empty</p>
                    <h1 className="font-sans text-2xl font-semibold">Nothing here yet</h1>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-sans text-sm font-medium transition-colors hover:opacity-80 text-primary"
                    >
                        <ArrowLeft size={14} />
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    const appearance = stripeAppearance(isDark);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-foreground">

            {/* ═══ MOBILE: Order summary toggle ═══ */}
            <div className="lg:hidden border-b border-border">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 font-sans text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-2 text-primary">
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
                        />
                        <span className="font-medium">
                            {mobileOpen ? 'Hide' : 'Show'} order summary
                        </span>
                    </div>
                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </button>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-[#F7F7F7] dark:bg-[#0A0A0A]"
                        >
                            <div className="px-5 pb-6">
                                <OrderSummary cart={cart} total={cartTotal} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ TWO-COLUMN LAYOUT ═══ */}
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* ─── LEFT: Order Summary Panel ─── */}
                <div className="w-full lg:w-[45%] bg-card border-b lg:border-b-0 lg:border-r border-border">
                    {/* Content container: right-aligned, max-width constrained */}
                    <div className="flex flex-col w-full max-w-[480px] ml-auto px-12 py-12">

                        {/* FIXED: Brand + Total */}
                        <div className="flex-shrink-0 mb-8">
                            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                                <ArrowLeft size={14} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                                <span className="font-display text-xl tracking-tight">
                                    hyper$lump
                                </span>
                                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Test
                                </span>
                            </Link>


                            <p className="font-sans text-[36px] font-bold tracking-tight leading-none text-foreground">
                                ${cartTotal.toFixed(2)}
                            </p>
                        </div>

                        {/* Product List */}
                        <div className="flex-shrink-0 space-y-4">
                            {/* Always visible: First Item */}
                            {cart.length > 0 && (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="w-[56px] h-[56px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-muted/20">
                                        {cart[0].image ? (
                                            <img src={cart[0].image} alt={cart[0].name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-medium text-muted-foreground/60">01</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-snug">{cart[0].name}</p>
                                            <p className="text-xs mt-0.5 text-muted-foreground">Qty 1</p>
                                        </div>
                                        <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                            ${(cart[0].amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Accordion for the rest */}
                            {cart.length > 1 && (
                                <div>
                                    <button
                                        onClick={() => setProductsOpen(!productsOpen)}
                                        className="w-full flex items-center justify-between py-3 font-sans text-sm cursor-pointer group hover:opacity-80 transition-opacity border-t border-foreground/[0.05]"
                                    >
                                        <span className="font-medium text-muted-foreground">
                                            {productsOpen ? 'Hide items' : `Show ${cart.length - 1} more ${cart.length - 1 === 1 ? 'item' : 'items'}`}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 text-muted-foreground ${productsOpen ? 'rotate-180' : ''}`}
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
                                                                <div className="w-[56px] h-[56px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-border bg-muted/20">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs font-medium text-muted-foreground/60">
                                                                            {String(i + 2).padStart(2, '0')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium leading-snug">{item.name}</p>
                                                                        <p className="text-xs mt-0.5 text-muted-foreground">Qty 1</p>
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

                        {/* Totals (always visible) */}
                        <div className="flex-shrink-0 font-sans">
                            <div className="pt-4 space-y-3 border-t border-foreground/[0.05]">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-foreground">$0.00</span>
                                </div>
                                <div className="flex justify-between text-sm pt-4 font-semibold border-t border-foreground/[0.05]">
                                    <span className="text-foreground">Total due today</span>
                                    <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* FIXED: Powered by Stripe */}
                        <div className="flex-shrink-0 pt-8 flex items-center gap-1.5 font-sans text-xs text-muted-foreground/60">
                            <span>Powered by</span>
                            <span className="font-bold text-muted-foreground">stripe</span>
                            <span className="mx-1">|</span>
                            <a href="#" className="hover:underline">Terms</a>
                            <a href="#" className="hover:underline">Privacy</a>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT: Payment Form ─── */}
                <div
                    className="flex-1 bg-background"
                >
                    <div className="w-full max-w-[480px] mr-auto px-5 lg:px-12 py-8 lg:py-12">

                        {isFreeOrder ? (
                            <FreeOrderPanel cart={cart} />
                        ) : clientSecret ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                <Elements options={{ clientSecret, appearance: appearance as any }} stripe={stripePromise}>
                                    <CheckoutForm amount={cartTotal} isDark={isDark} />
                                </Elements>
                            </motion.div>
                        ) : error ? (
                            <div className="p-4 rounded-md bg-alert/10 border border-alert/20 text-alert font-medium">
                                <p className="font-sans text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin" />
                                <p className="font-sans text-sm text-muted-foreground">Loading checkout…</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ORDER SUMMARY (used in both desktop + mobile)
   ───────────────────────────────────────────── */
function OrderSummary({ cart, total }: { cart: any[]; total: number }) {
    return (
        <div className="font-sans">
            {/* Items */}
            <div className="space-y-5">
                {cart.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="w-[64px] h-[64px] flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center border border-foreground/[0.05] bg-foreground/[0.03]">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-medium text-muted-foreground/60">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-snug text-foreground">{item.name}</p>
                                <p className="text-xs mt-0.5 text-muted-foreground">Qty 1</p>
                            </div>
                            <span className="text-sm font-medium flex-shrink-0 text-foreground">
                                ${(item.amount || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="mt-8 pt-6 space-y-3 border-t border-border">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
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

/* ─────────────────────────────────────────────
   FREE ORDER — EMAIL CAPTURE FORM
   ───────────────────────────────────────────── */
function FreeOrderPanel({ cart }: { cart: any[] }) {
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);

        // Store email + cart for the downloads page
        localStorage.setItem('hyperslump-download-email', email);
        localStorage.setItem('hyperslump-download-newsletter', newsletter ? 'yes' : 'no');
        localStorage.setItem('hyperslump-download-items', JSON.stringify(
            cart.map(item => ({ id: item.id, name: item.name, image: item.image }))
        ));

        // Small delay for perceived loading
        await new Promise(r => setTimeout(r, 400));
        router.push('/downloads');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-sans">
            <h2 className="text-lg font-semibold mb-1 text-foreground">
                Get your assets
            </h2>
            <p className="text-sm mb-8 text-muted-foreground">
                Enter your email to receive your download links.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
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
                        className="w-full h-[44px] px-3 rounded-md text-sm outline-none transition-all duration-150 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm"
                    />
                </div>

                {/* Newsletter opt-in */}
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                        <input
                            type="checkbox"
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-[18px] h-[18px] rounded-[4px] border border-border transition-all duration-150 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary">
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
                        <p className="text-xs mt-0.5 text-muted-foreground">
                            Get notified about new sample packs, exclusive drops, and producer tips.
                        </p>
                    </div>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting || !email}
                    className="group relative w-full h-[48px] rounded-md font-medium text-[15px] transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                         bg-primary text-primary-foreground 
                         shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(99,91,255,0.4)]
                         hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(99,91,255,0.5)]
                         hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                            Preparing…
                        </span>
                    ) : (
                        'Get your assets'
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Your information is secure</span>
            </div>
        </motion.div>
    );
}
