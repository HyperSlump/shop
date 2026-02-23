'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart, type Product } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconChevronDown, IconLock, IconTruck } from '@tabler/icons-react';
import AestheticBackground from '@/components/AestheticBackground';

interface ShippingRateOption {
    id: string;
    name: string;
    rate: string;
    currency: string;
    min_delivery_days?: number;
    max_delivery_days?: number;
}

const ALLOWED_SHIPPING_COUNTRIES: string[] = [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'KR', 'NL', 'SE',
    'NO', 'DK', 'IT', 'ES', 'PT', 'BE', 'AT', 'CH', 'PL', 'IE',
    'NZ', 'FI', 'MX', 'BR', 'SG',
];

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
    const [paymentIntentId, setPaymentIntentId] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingRateOptions, setShippingRateOptions] = useState<ShippingRateOption[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productsOpen, setProductsOpen] = useState(false);

    const hasPhysicalItems = cart.some(item => item.metadata?.type === 'PHYSICAL');
    const isFreeOrder = cartTotal === 0 && cart.length > 0;

    const refreshIntent = useCallback(async (currentShipping = 0, address: any = null) => {
        try {
            const recipientData = address ? {
                name: address.name,
                address1: address.address.line1,
                city: address.address.city,
                state: address.address.state,
                zip: address.address.postal_code,
                country_code: address.address.country
            } : null;

            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shippingAmount: currentShipping,
                    recipient: recipientData,
                    paymentIntentId: paymentIntentId || undefined
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.id);
            }
        } catch (err: any) {
            console.error('Intent error:', err);
            setError(err.message);
        }
    }, [cart, paymentIntentId]);

    useEffect(() => {
        if (cart.length > 0 && !clientSecret && !isFreeOrder) {
            refreshIntent(0);
        }
    }, [cart.length, clientSecret, refreshIntent, isFreeOrder]);

    const handleAddressChange = async (addressValue: any) => {
        if (!hasPhysicalItems) return;
        setIsCalculating(true);
        try {
            const res = await fetch('/api/printful/shipping-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: {
                        address1: addressValue.address.line1,
                        city: addressValue.address.city,
                        state_code: addressValue.address.state,
                        country_code: addressValue.address.country,
                        zip: addressValue.address.postal_code
                    },
                    items: cart
                })
            });
            const data = await res.json();
            if (data.rates && data.rates.length > 0) {
                // Sort by price ascending and store all options
                const sorted = [...data.rates].sort(
                    (a: ShippingRateOption, b: ShippingRateOption) => parseFloat(a.rate) - parseFloat(b.rate)
                );
                setShippingRateOptions(sorted);
                const cost = parseFloat(sorted[0].rate);
                setShippingCost(cost);
                await refreshIntent(cost, addressValue);
            } else {
                setShippingRateOptions([]);
                setShippingCost(0);
            }
        } catch (err) {
            console.error('Shipping calculation error:', err);
            setShippingRateOptions([]);
        } finally {
            setIsCalculating(false);
        }
    };

    const finalTotal = cartTotal + shippingCost;

    if (cart.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-transparent text-foreground relative">
                <div className="text-center space-y-6 px-6 relative z-10">
                    <p className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Your cart is empty</p>
                    <h1 className="font-sans text-[1.75rem] font-semibold tracking-tight">Nothing here yet</h1>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-sans text-sm font-medium transition-colors hover:opacity-80 text-primary"
                    >
                        <IconArrowLeft size={14} stroke={2} />
                        Continue shopping
                    </Link>
                </div>
                <AestheticBackground showScanlines={true} />
            </div>
        );
    }

    const appearance = stripeAppearance(isDark);

    return (
        <div className="min-h-screen flex flex-col bg-[#060708] text-foreground relative overflow-x-hidden">

            <div className="flex-1 flex flex-col lg:flex-row relative z-10">
                <div className="w-full lg:w-[44%] drawer-surface border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
                    <div className="flex flex-col w-full max-w-[500px] ml-auto px-6 lg:px-12 py-8 lg:py-12">
                        <div className="flex-shrink-0 mb-6 lg:mb-8">
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
                                ${finalTotal.toFixed(2)}
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
                                    {isCalculating ? (
                                        <span className="text-primary animate-pulse text-xs uppercase tracking-widest font-mono">Calculating...</span>
                                    ) : shippingCost > 0 ? (
                                        <span className="text-foreground">${shippingCost.toFixed(2)}</span>
                                    ) : hasPhysicalItems ? (
                                        <span className="text-muted text-xs italic">Enter address</span>
                                    ) : (
                                        <span className="text-foreground">$0.00</span>
                                    )}
                                </div>

                                {/* Shipping rate breakdown */}
                                <AnimatePresence>
                                    {shippingRateOptions.length > 0 && !isCalculating && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-2 pb-1">
                                                {shippingRateOptions.map((rate, i) => (
                                                    <div
                                                        key={rate.id}
                                                        className={`flex items-center justify-between py-1.5 px-2.5 rounded text-xs transition-colors
                                                            ${i === 0
                                                                ? 'bg-primary/8 border border-primary/15'
                                                                : 'border border-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className={`font-medium ${i === 0 ? 'text-foreground' : 'text-muted'}`}>
                                                                {rate.name}
                                                                {i === 0 && <span className="text-primary ml-1.5 text-[9px] uppercase tracking-wider font-mono">selected</span>}
                                                            </span>
                                                            {(rate.min_delivery_days || rate.max_delivery_days) && (
                                                                <span className="text-[10px] text-muted mt-0.5">
                                                                    {rate.min_delivery_days && rate.max_delivery_days
                                                                        ? `${rate.min_delivery_days}\u2013${rate.max_delivery_days} business days`
                                                                        : rate.max_delivery_days
                                                                            ? `Up to ${rate.max_delivery_days} business days`
                                                                            : `From ${rate.min_delivery_days} business days`
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`font-medium tabular-nums ${i === 0 ? 'text-foreground' : 'text-muted'}`}>
                                                            {parseFloat(rate.rate) === 0 ? 'Free' : `$${parseFloat(rate.rate).toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between text-sm pt-4 font-semibold border-t border-border">
                                    <span className="text-foreground">Total due today</span>
                                    <span className="text-foreground">${finalTotal.toFixed(2)}</span>
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
                            <FreeOrderPanel cart={cart} />
                        ) : clientSecret ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                    <CheckoutForm
                                        amount={finalTotal}
                                        isDark={isDark}
                                        hasPhysicalItems={hasPhysicalItems}
                                        allowedCountries={ALLOWED_SHIPPING_COUNTRIES}
                                        onAddressChange={handleAddressChange}
                                        isCalculating={isCalculating}
                                    />
                                </Elements>
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

function FreeOrderPanel({ cart }: { cart: Product[] }) {
    const { clearCart } = useCart();
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
                    className="group relative w-full h-[48px] rounded-md font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                         bg-primary text-primary-foreground
                         shadow-[0_4px_16px_rgba(var(--primary-rgb),0.18)]
                         hover:brightness-110 active:scale-[0.99]"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                            preparing_assets
                        </span>
                    ) : (
                        'complete_order'
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
