'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Map price IDs to downloadable file URLs (same mapping as success page)
const PRODUCT_FILES: Record<string, { label: string; url: string }> = {
    'price_1T070gHlah70mYw2Oe7IA8q8': { label: 'HYPERSLUMP_01', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
    'price_1T077bHlah70mYw2Oa6IwZgB': { label: 'HYPERSLUMP_02', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
    'price_1T076PHlah70mYw2D01WCvIT': { label: 'HYPERSLUMP_03', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
    'price_1Szmy3Hlah70mYw2t6BkUO6O': { label: 'HYPERSLUMP_04', url: 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/hyperslump_1.zip' },
};
const PRODUCT_FILES_FALLBACK = 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/sample_product_1.zip';

export default function CheckoutPage() {
    const { cartTotal, cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [summaryOpen, setSummaryOpen] = useState(false);

    const isDark = theme === 'dark';

    useEffect(() => {
        const checkTheme = () => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        if (cartTotal > 0 && cart.length > 0) {
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`API_ERROR: ${res.status} - ${text}`);
                    }
                    return res.json();
                })
                .then((data) => setClientSecret(data.clientSecret))
                .catch(err => setError(err.message || 'Failed to initialize payment.'));
        }

        return () => observer.disconnect();
    }, [cartTotal, cart]);

    const appearance = {
        theme: (isDark ? 'night' : 'stripe') as any,
        variables: {
            colorPrimary: isDark ? '#FAFAFA' : '#1A1F36',
            colorBackground: isDark ? '#0A0A0A' : '#FFFFFF',
            colorText: isDark ? '#FAFAFA' : '#1A1F36',
            colorDanger: '#FF3B30',
            fontFamily: '"JetBrains Mono", monospace',
            spacingUnit: '4px',
            borderRadius: '4px',
            colorTextPlaceholder: isDark ? 'rgba(250,250,250,0.3)' : 'rgba(26,31,54,0.35)',
        },
        rules: {
            '.Input': {
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(26, 31, 54, 0.15)',
                boxShadow: 'none',
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                color: isDark ? '#FAFAFA' : '#1A1F36',
                fontSize: '13px',
                padding: '12px 14px',
            },
            '.Input:focus': {
                border: isDark ? '1px solid rgba(250, 250, 250, 0.4)' : '1px solid rgba(26, 31, 54, 0.5)',
                boxShadow: isDark ? '0 0 0 1px rgba(250, 250, 250, 0.2)' : '0 0 0 1px rgba(26, 31, 54, 0.15)',
            },
            '.Input:hover': {
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(26, 31, 54, 0.3)',
            },
            '.Label': {
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'uppercase' as const,
                fontSize: '10px',
                letterSpacing: '0.15em',
                color: isDark ? 'rgba(250, 250, 250, 0.5)' : 'rgba(26, 31, 54, 0.5)',
                marginBottom: '8px',
            },
            '.Tab': {
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(26, 31, 54, 0.1)',
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(26, 31, 54, 0.6)',
            },
            '.Tab:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(26, 31, 54, 0.04)',
                color: isDark ? '#FAFAFA' : '#1A1F36',
            },
            '.Tab--selected': {
                border: isDark ? '1px solid rgba(250, 250, 250, 0.4)' : '1px solid rgba(26, 31, 54, 0.4)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(26, 31, 54, 0.04)',
                color: isDark ? '#FAFAFA' : '#1A1F36',
            },
            '.TabIcon--selected': {
                fill: isDark ? '#FAFAFA' : '#1A1F36',
            },
            '.Block': {
                backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(26, 31, 54, 0.08)',
            },
        }
    };

    // Theme-aware color tokens for the layout
    const bg = isDark ? 'bg-black' : 'bg-white';
    const bgPanel = isDark ? 'bg-[#050505]' : 'bg-[#F5F5F5]';
    const text = isDark ? 'text-white' : 'text-[#1A1F36]';
    const textMuted = isDark ? 'text-white/60' : 'text-[#1A1F36]/60';
    const textFaint = isDark ? 'text-white/30' : 'text-[#1A1F36]/30';
    const textFaintest = isDark ? 'text-white/20' : 'text-[#1A1F36]/20';
    const border = isDark ? 'border-white/[0.06]' : 'border-[#1A1F36]/[0.08]';
    const borderMed = isDark ? 'border-white/10' : 'border-[#1A1F36]/10';
    const borderHover = isDark ? 'border-white/20' : 'border-[#1A1F36]/20';
    const borderHoverStrong = isDark ? 'border-white/40' : 'border-[#1A1F36]/40';
    const dotBg = isDark ? 'bg-white' : 'bg-[#1A1F36]';
    const dotBgHover = isDark ? 'bg-white/60' : 'bg-[#1A1F36]/60';
    const spinnerBorder = isDark ? 'border-white/10 border-t-white/60' : 'border-[#1A1F36]/10 border-t-[#1A1F36]/60';
    const btnBg = isDark ? 'bg-white text-black' : 'bg-[#1A1F36] text-white';

    const isFreeOrder = cartTotal === 0 && cart.length > 0;

    // Empty cart state
    if (cart.length === 0) {
        return (
            <div className={`min-h-screen ${bg} flex items-center justify-center`}>
                <div className="text-center space-y-6 p-12">
                    <div className={`font-mono text-[10px] tracking-[0.4em] ${textFaint} uppercase`}>Your cart is empty</div>
                    <h1 className={`text-2xl font-gothic tracking-tight ${text} lowercase`}>nothing here yet</h1>
                    <Link href="/" className={`inline-block border ${borderHover} px-8 py-3 font-mono text-[10px] uppercase tracking-[0.3em] ${textMuted} hover:${text} hover:${borderHoverStrong} transition-all rounded`}>
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-screen max-h-screen flex flex-col ${bg} ${text} relative overflow-hidden`}>
            {/* Mobile Order Summary Toggle */}
            <div className={`lg:hidden border-b ${borderMed}`}>
                <button
                    onClick={() => setSummaryOpen(!summaryOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 font-mono text-xs cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <svg className={`w-3 h-3 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className={`uppercase tracking-[0.2em] ${textMuted}`}>
                            {summaryOpen ? 'Hide' : 'Show'} order summary
                        </span>
                    </div>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </button>

                <AnimatePresence>
                    {summaryOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden px-6 pb-6"
                        >
                            <OrderSummary cart={cart} cartTotal={cartTotal} isDark={isDark} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`flex-1 flex flex-col lg:flex-row ${bg}`}>
                {/* LEFT: Order Summary (Desktop) */}
                <div className={`hidden lg:flex lg:w-1/2 ${bgPanel} border-r ${border} flex-col relative group/panel h-full overflow-hidden`}>
                    <div className="flex-1 flex flex-col max-w-[420px] ml-auto w-full px-8 py-12 h-full overflow-hidden">
                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-3 mb-10 group relative">
                            <span className="text-3xl font-gothic tracking-tighter hover:text-primary transition-all duration-300">
                                h$
                            </span>
                        </Link>

                        <div className="flex-1 min-h-0 flex flex-col">
                            <OrderSummary cart={cart} cartTotal={cartTotal} isDark={isDark} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Payment Form or Free Claim */}
                <div className="flex-1 flex flex-col relative group/content h-full overflow-hidden">
                    <div className="flex-1 flex flex-col max-w-[420px] mr-auto w-full px-8 py-12 h-full overflow-y-auto custom-scrollbar">
                        {/* Section Header */}
                        <div className="mb-10 space-y-2">
                            <div className={`font-mono text-[9px] tracking-[0.4em] ${textFaintest} uppercase`}>
                                {isFreeOrder ? 'Free Download' : 'Secure Payment'}
                            </div>
                            <h1 className={`text-xl font-gothic tracking-tight ${text} lowercase`}>
                                {isFreeOrder ? 'claim your downloads' : 'payment details'}
                            </h1>
                        </div>

                        {isFreeOrder ? (
                            /* ─── Free Order: Download Links Inline ─── */
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >

                                <div className="space-y-4">
                                    {cart.map((item) => {
                                        const fileUrl = PRODUCT_FILES[item.id]?.url || PRODUCT_FILES_FALLBACK;
                                        const fileLabel = PRODUCT_FILES[item.id]?.label || item.name;
                                        return (
                                            <div key={item.id} className={`p-6 border ${border} space-y-4 relative overflow-hidden group rounded-lg`}>
                                                <div className={`flex justify-between items-center font-mono text-[8px] ${textFaintest} uppercase tracking-[0.3em]`}>
                                                    <span>Asset: {item.name}</span>
                                                    <span className="text-green-500">FREE</span>
                                                </div>

                                                <a
                                                    href={fileUrl}
                                                    download
                                                    className={`inline-flex items-center gap-3 font-mono font-bold uppercase tracking-[0.2em] text-[11px] hover:text-primary transition-all duration-300 group`}
                                                >
                                                    <Download size={14} className={`${textFaintest} group-hover:text-primary transition-colors`} />
                                                    <span className="border-b border-white/10 group-hover:border-primary pb-1">
                                                        Download: {fileLabel}
                                                    </span>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>

                            </motion.div>
                        ) : (
                            /* ─── Paid Order Flow ─── */
                            <AnimatePresence mode="wait">
                                {error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="border border-red-500/20 bg-red-500/5 p-8 space-y-4 rounded">
                                            <div className="text-red-400 font-mono text-[10px] tracking-[0.2em] uppercase">
                                                [ERROR]: PAYMENT_INIT_FAIL
                                            </div>
                                            <p className={`font-mono text-[11px] ${textFaint} leading-relaxed`}>
                                                {error}
                                            </p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className={`border ${borderHover} px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] ${textMuted} hover:${borderHoverStrong} transition-all cursor-pointer`}
                                            >
                                                Retry Connection
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : clientSecret ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                            <CheckoutForm amount={cartTotal} isDark={isDark} />
                                        </Elements>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-20 space-y-6"
                                    >
                                        <div className={`w-8 h-8 border ${spinnerBorder} rounded-full animate-spin`} />
                                        <div className="space-y-2 text-center">
                                            <span className={`block font-mono text-[10px] uppercase tracking-[0.3em] ${textFaint} animate-pulse`}>
                                                Initializing...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}


                        {/* Footer Security Removed */}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Order Summary Sub-Component ──────────────────────── */
/* ─── Order Summary Sub-Component ──────────────────────── */
function OrderSummary({ cart, cartTotal, isDark }: { cart: any[]; cartTotal: number; isDark: boolean }) {
    const [itemsOpen, setItemsOpen] = useState(true);

    const textSub = isDark ? 'text-white' : 'text-[#1A1F36]';
    const textMuted = isDark ? 'text-white/30' : 'text-[#1A1F36]/30';
    const textPrice = isDark ? 'text-white/70' : 'text-[#1A1F36]/70';
    const textTotal = isDark ? 'text-white' : 'text-[#1A1F36]';
    const textTotalLabel = isDark ? 'text-white/40' : 'text-[#1A1F36]/40';
    const border = isDark ? 'border-white/5' : 'border-[#1A1F36]/5';
    const borderStrong = isDark ? 'border-white/10' : 'border-[#1A1F36]/10';
    const thumbBg = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-[#1A1F36]/[0.03] border-[#1A1F36]/10';
    const thumbText = isDark ? 'text-white/10' : 'text-[#1A1F36]/10';

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
            {/* Items Header / Toggle */}
            <button
                onClick={() => setItemsOpen(!itemsOpen)}
                className={`flex items-center justify-between py-4 border-b ${borderStrong} group cursor-pointer mb-2`}
            >
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.3em] ${textTotalLabel}`}>
                        Contents ({cart.length})
                    </span>
                    <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${itemsOpen ? 'rotate-180' : ''} ${textTotalLabel} group-hover:text-foreground`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Line Items - Scrollable Area (Accordion-like) */}
            <AnimatePresence initial={false}>
                {itemsOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 mb-6"
                    >
                        <div className="space-y-0">
                            {cart.map((item, i) => (
                                <div key={item.id} className={`flex items-center gap-6 py-5 border-b ${border} last:border-0 group/item`}>
                                    {/* Product Thumbnail */}
                                    <div className={`w-12 h-12 ${thumbBg} border flex-shrink-0 flex items-center justify-center overflow-hidden rounded`}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover contrast-125 grayscale group-hover/item:grayscale-0 transition-all duration-500" />
                                        ) : (
                                            <div className={`font-mono text-[8px] ${thumbText} uppercase`}>
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className={`font-mono text-[10px] font-bold ${textSub} uppercase tracking-[0.15em] mb-1 truncate`}>
                                                {item.name}
                                            </p>
                                            <p className={`font-mono text-[8px] ${textMuted} uppercase tracking-[0.1em]`}>
                                                ID: {item.id.slice(0, 8)}
                                            </p>
                                        </div>
                                        <span className={`font-mono text-[11px] ${textPrice} flex-shrink-0`}>
                                            ${(item.amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Totals - Fixed Bottom */}
            <div className="space-y-4 pt-10 mt-auto border-t border-white/5 bg-[var(--background)]">
                <div className={`flex justify-between font-mono text-[10px] ${textMuted} uppercase tracking-[0.2em]`}>
                    <span>Subtotal</span>
                    <span className={`${textSub}/60`}>${cartTotal.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-mono text-[10px] ${textMuted} uppercase tracking-[0.2em]`}>
                    <span>Taxation</span>
                    <span className={`${textSub}/60`}>0.00</span>
                </div>
                <div className={`flex justify-between pt-8 border-t ${borderStrong} items-end`}>
                    <span className={`font-mono text-[11px] ${textTotalLabel} uppercase tracking-[0.2em] pb-1`}>Grand Total</span>
                    <span className={`font-mono text-4xl font-bold ${textTotal} tracking-tighter`}>${cartTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
