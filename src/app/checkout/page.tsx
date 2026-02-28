'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart, type Product } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import ShippingForm, { type ShippingAddress } from '@/components/ShippingForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconChevronDown, IconLock, IconTruck, IconAlertTriangle, IconTrash, IconMinus, IconPlus } from '@tabler/icons-react';
import AestheticBackground from '@/components/AestheticBackground';
import PageBreadcrumb from '@/components/PageBreadcrumb';

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
    const {
        cartTotal,
        cart,
        removeFromCart,
        updateQuantity,
        setHasVisitedCheckout,
        estimatedShipping,
        estimatedTax,
        isEstimatingShipping,
    } = useCart();
    const isDark = useTheme();

    useEffect(() => {
        setHasVisitedCheckout(true);
    }, [setHasVisitedCheckout]);

    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentId, setPaymentIntentId] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [taxCost, setTaxCost] = useState(0);
    const [shippingRateOptions, setShippingRateOptions] = useState<ShippingRateOption[]>([]);
    const [selectedShippingId, setSelectedShippingId] = useState<string>('');
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [checkoutAddress, setCheckoutAddress] = useState<ShippingAddress | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shippingError, setShippingError] = useState<string | null>(null);
    const [productsOpen, setProductsOpen] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [hasSeededEstimate, setHasSeededEstimate] = useState(false);

    const hasPhysicalItems = cart.some(item => item.metadata?.type === 'PHYSICAL');
    const isFreeOrder = cartTotal === 0 && cart.length > 0;

    const refreshIntent = useCallback(async (currentShipping = 0, address: ShippingAddress | null = null, shippingId?: string, taxAmount: number = taxCost) => {
        try {
            const recipientData = address ? {
                name: `${address.firstName} ${address.lastName}`.trim(),
                address1: address.address1,
                city: address.city,
                state: address.state_code,
                zip: address.zip,
                country_code: address.country_code
            } : null;

            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shippingAmount: currentShipping,
                    taxAmount: taxAmount,
                    shippingId,
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
                // Unconditionally update taxCost from the server response
                // This ensures it resets to 0 if the server says it's 0 (e.g. non-taxable address)
                setTaxCost(data.amount_tax || 0);
            }
        } catch (err: any) {
            console.error('Intent error:', err);
            setError(err.message);
        }
    }, [cart, paymentIntentId, taxCost]);

    useEffect(() => {
        if (cart.length > 0 && !clientSecret && !isFreeOrder) {
            refreshIntent(0);
        }
    }, [cart.length, clientSecret, refreshIntent, isFreeOrder]);

    useEffect(() => {
        setHasSeededEstimate(false);
    }, [cart]);

    useEffect(() => {
        if (!hasPhysicalItems) return;
        if (checkoutAddress?.address1) return;
        if (hasSeededEstimate) return;
        if (estimatedShipping === null && estimatedTax === null) return;

        const seededShipping = estimatedShipping ?? 0;
        const seededTax = estimatedTax ?? 0;

        setShippingCost(seededShipping);
        setTaxCost(seededTax);
        setShippingError(null);
        setHasSeededEstimate(true);

        if (!isFreeOrder) {
            void refreshIntent(seededShipping, null, undefined, seededTax);
        }
    }, [
        hasPhysicalItems,
        checkoutAddress?.address1,
        hasSeededEstimate,
        estimatedShipping,
        estimatedTax,
        isFreeOrder,
        refreshIntent,
    ]);

    const handleAddressChange = useCallback(async (addressValue: ShippingAddress) => {
        if (!hasPhysicalItems) return;
        const normalizedAddress: ShippingAddress = {
            ...addressValue,
            country_code: (addressValue.country_code || '').toUpperCase(),
        };
        setCheckoutAddress(normalizedAddress);

        // Clear rates if address is incomplete
        if (!normalizedAddress.address1 || !normalizedAddress.city || !normalizedAddress.country_code || !normalizedAddress.zip) {
            setShippingRateOptions([]);
            setSelectedShippingId('');
            setShippingCost(0);
            setTaxCost(0);
            setHasSeededEstimate(false);
            setShippingError(null);
            setIsRefreshingQuote(false);
            return;
        }

        if (!ALLOWED_SHIPPING_COUNTRIES.includes(normalizedAddress.country_code)) {
            setShippingRateOptions([]);
            setSelectedShippingId('');
            setShippingCost(0);
            setTaxCost(0);
            setHasSeededEstimate(false);
            setShippingError('Shipping is not available for this destination yet.');
            setIsRefreshingQuote(false);
            return;
        }

        const hasExistingQuote = Boolean(selectedShippingId || shippingCost > 0 || taxCost > 0);
        setIsCalculating(true);
        setIsRefreshingQuote(hasExistingQuote);
        setShippingError(null);
        try {
            const res = await fetch('/api/printful/shipping-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: {
                        address1: normalizedAddress.address1,
                        city: normalizedAddress.city,
                        state_code: normalizedAddress.state_code,
                        country_code: normalizedAddress.country_code,
                        zip: normalizedAddress.zip
                    },
                    items: cart
                })
            });

            if (res.ok) {
                const data = await res.json();
                console.log('>>> [CHECKOUT_PAGE] Shipping rates fetched:', data);

                if (!data.rates || data.rates.length === 0) {
                    console.warn('>>> [CHECKOUT_PAGE] No shipping rates returned');
                    setShippingRateOptions([]);
                    setSelectedShippingId('');
                    setShippingCost(0);
                    setTaxCost(0);
                    if (data.error) setShippingError(data.error);
                } else {
                    const sorted = [...data.rates].sort(
                        (a: ShippingRateOption, b: ShippingRateOption) => parseFloat(a.rate) - parseFloat(b.rate)
                    );
                    const cheapest = sorted[0];
                    setShippingRateOptions(sorted);
                    setSelectedShippingId(cheapest.id);

                    const cost = parseFloat(cheapest.rate);
                    setShippingCost(cost);

                    if (typeof data.tax === 'number') {
                        console.log('>>> [CHECKOUT_PAGE] Setting tax cost from Printful:', data.tax);
                        setTaxCost(data.tax);
                        await refreshIntent(cost, normalizedAddress, cheapest.id, data.tax);
                    } else {
                        // Reset tax if no tax is returned from Printful
                        setTaxCost(0);
                        await refreshIntent(cost, normalizedAddress, cheapest.id, 0);
                    }
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('>>> [CHECKOUT_PAGE] API Error:', errorData);
                if (hasExistingQuote) {
                    setShippingError('Unable to refresh shipping quote. Showing last known quote.');
                } else {
                    setShippingError(errorData.error || 'Failed to calculate shipping');
                    setShippingRateOptions([]);
                    setSelectedShippingId('');
                    setShippingCost(0);
                    setTaxCost(0);
                }
            }
        } catch (err: any) {
            console.error('Shipping calculation error:', err);
            if (hasExistingQuote) {
                setShippingError('Unable to refresh shipping quote. Showing last known quote.');
            } else {
                setShippingError(err.message || 'Failed to calculate shipping');
                setShippingRateOptions([]);
                setSelectedShippingId('');
                setShippingCost(0);
                setTaxCost(0);
            }
        } finally {
            setIsCalculating(false);
            setIsRefreshingQuote(false);
        }
    }, [hasPhysicalItems, cart, refreshIntent, selectedShippingId, shippingCost, taxCost]);


    const handleRateSelect = async (rate: ShippingRateOption) => {
        if (isCalculating || rate.id === selectedShippingId) return;
        setIsCalculating(true);
        setSelectedShippingId(rate.id);
        const cost = parseFloat(rate.rate);
        setShippingCost(cost);
        await refreshIntent(cost, checkoutAddress, rate.id);
        setIsCalculating(false);
    };

    const finalTotal = cartTotal + shippingCost + taxCost;
    const showingPrefillEstimate = hasPhysicalItems && !checkoutAddress?.address1 && (hasSeededEstimate || isEstimatingShipping);

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
        <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">

            <div className="flex-1 flex flex-col lg:flex-row relative z-10">
                <div className="order-2 lg:order-1 w-full lg:w-[44%] drawer-surface dark:bg-[#0c0d0f] border-b lg:border-b-0 border-border relative overflow-hidden">
                    <div className="flex flex-col w-full max-w-[500px] ml-auto px-6 lg:px-12 py-8 lg:py-12">
                        <div className="flex-shrink-0 mb-6 lg:mb-8">
                            <PageBreadcrumb
                                items={[
                                    { label: 'store', href: '/' },
                                    { label: 'checkout' },
                                ]}
                                className="mb-6"
                            />

                            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                                <IconArrowLeft size={14} stroke={2} className="text-muted group-hover:-translate-x-0.5 transition-transform" />
                                <span
                                    className="brand-logo-jacquard text-[2rem] leading-none tracking-tight text-foreground"
                                    style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                                >
                                    hyper$lump
                                </span>
                                <span className="text-[9px] bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                    Test
                                </span>
                            </Link>

                            <div className="flex items-end justify-between w-full">
                                <p className="font-sans text-[40px] font-semibold tracking-tight leading-none text-foreground">
                                    ${finalTotal.toFixed(2)}
                                </p>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setIsEditingOrder(!isEditingOrder)}
                                        className="font-sans text-xs text-muted hover:underline pb-1 cursor-pointer transition-colors hover:text-foreground"
                                    >
                                        {isEditingOrder ? 'Done Editing' : 'Edit Order'}
                                    </button>
                                )}
                            </div>
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
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium leading-snug text-foreground truncate">{cart[0].name}</p>

                                            {isEditingOrder ? (
                                                <div className="mt-2 flex items-center gap-3">
                                                    {cart[0].metadata?.type === 'PHYSICAL' ? (
                                                        <div className="flex items-center gap-3 bg-muted/10 rounded px-2 py-1">
                                                            <button onClick={() => updateQuantity(cart[0].id, Math.max(0, (cart[0]?.quantity ?? 1) - 1))} className="text-muted hover:text-foreground transition-colors">
                                                                {(cart[0]?.quantity ?? 1) <= 1 ? <IconTrash size={12} stroke={2} /> : <IconMinus size={12} stroke={2} />}
                                                            </button>
                                                            <span className="text-xs font-medium w-4 text-center text-foreground">{cart[0]?.quantity ?? 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(cart[0].id, (cart[0]?.quantity ?? 1) + 1)}
                                                                disabled={(cart[0]?.quantity ?? 1) >= 10}
                                                                className={`text-muted transition-colors ${(cart[0]?.quantity ?? 1) >= 10 ? 'opacity-20 cursor-not-allowed' : 'hover:text-foreground'}`}
                                                            >
                                                                <IconPlus size={12} stroke={2} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => removeFromCart(cart[0].id)}
                                                            className="flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors mt-1"
                                                        >
                                                            <IconTrash size={12} stroke={2} />
                                                            <span>Remove</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs mt-0.5 text-muted">Qty {cart[0]?.quantity ?? 1}</p>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium flex-shrink-0 text-foreground pt-0.5">
                                            ${((cart[0]?.amount ?? 0) * (cart[0]?.quantity ?? 1)).toFixed(2)}
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
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-sm font-medium leading-snug text-foreground truncate">{item.name}</p>

                                                                        {isEditingOrder ? (
                                                                            <div className="mt-2 flex items-center gap-3">
                                                                                {item.metadata?.type === 'PHYSICAL' ? (
                                                                                    <div className="flex items-center gap-3 bg-muted/10 rounded px-2 py-1">
                                                                                        <button onClick={() => updateQuantity(item.id, Math.max(0, (item.quantity ?? 1) - 1))} className="text-muted hover:text-foreground transition-colors">
                                                                                            {(item.quantity ?? 1) <= 1 ? <IconTrash size={12} stroke={2} /> : <IconMinus size={12} stroke={2} />}
                                                                                        </button>
                                                                                        <span className="text-xs font-medium w-4 text-center text-foreground">{item.quantity ?? 1}</span>
                                                                                        <button
                                                                                            onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                                                                                            disabled={(item.quantity ?? 1) >= 10}
                                                                                            className={`text-muted transition-colors ${(item.quantity ?? 1) >= 10 ? 'opacity-20 cursor-not-allowed' : 'hover:text-foreground'}`}
                                                                                        >
                                                                                            <IconPlus size={12} stroke={2} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => removeFromCart(item.id)}
                                                                                        className="flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors mt-1"
                                                                                    >
                                                                                        <IconTrash size={12} stroke={2} />
                                                                                        <span>Remove</span>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs mt-0.5 text-muted">Qty {item.quantity ?? 1}</p>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-medium flex-shrink-0 text-foreground pt-0.5">
                                                                        ${((item.amount ?? 0) * (item.quantity ?? 1)).toFixed(2)}
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
                                {hasPhysicalItems && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">
                                            {shippingCost > 0 ? 'Standard Shipping' : 'Shipping'}
                                        </span>
                                        {isCalculating && !isRefreshingQuote ? (
                                            <span className="text-muted text-xs italic">--</span>
                                        ) : shippingCost > 0 ? (
                                            <span className="text-foreground">${shippingCost.toFixed(2)}</span>
                                        ) : showingPrefillEstimate ? (
                                            <span className="text-muted text-xs italic">
                                                {isEstimatingShipping ? 'Calculating estimate...' : '$0.00'}
                                            </span>
                                        ) : (
                                            <span className="text-muted text-xs italic">
                                                {checkoutAddress?.address1 ? 'Unavailable' : 'Enter address below'}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Tax</span>
                                    {isCalculating && !isRefreshingQuote ? (
                                        <span className="text-muted text-xs italic">--</span>
                                    ) : taxCost > 0 ? (
                                        <span className="text-foreground">${taxCost.toFixed(2)}</span>
                                    ) : showingPrefillEstimate ? (
                                        <span className="text-muted text-xs italic">
                                            {isEstimatingShipping ? 'Calculating estimate...' : '$0.00'}
                                        </span>
                                    ) : (
                                        <span className="text-muted text-xs italic">
                                            {checkoutAddress?.address1 ? '$0.00' : '--'}
                                        </span>
                                    )}
                                </div>
                                {showingPrefillEstimate && !isCalculating && (
                                    <div className="pt-1 text-[11px] text-muted italic">
                                        Estimated by location. Finalized after full address entry.
                                    </div>
                                )}
                                {isCalculating && isRefreshingQuote && (
                                    <div className="pt-1 text-[11px] text-muted italic">
                                        Refreshing latest shipping and tax quote...
                                    </div>
                                )}
                                {shippingError && (
                                    <div className="pt-1 text-[11px] text-alert/80">
                                        {shippingError}
                                    </div>
                                )}
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

                <div
                    className="order-1 lg:order-2 flex-1 bg-background relative z-20"
                    style={{
                        boxShadow: isDark
                            ? '-12px 0 48px -12px rgba(0,0,0,0.5)'
                            : '-12px 0 32px -12px rgba(50,20,30,0.12)'
                    }}
                >
                    <div className="w-full max-w-[520px] mr-auto px-5 lg:px-12 py-8 lg:py-12">
                        {isFreeOrder ? (
                            <FreeOrderPanel cart={cart} />
                        ) : clientSecret ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                {hasPhysicalItems && (
                                    <div className="mb-8 pb-8 border-b border-border">
                                        <ShippingForm
                                            onAddressSelected={handleAddressChange}
                                            isDark={isDark}
                                            isCalculating={isCalculating}
                                        />
                                    </div>
                                )}
                                <Elements
                                    options={{
                                        clientSecret,
                                        appearance,
                                    }}
                                    stripe={stripePromise}
                                >
                                    <CheckoutForm
                                        amount={finalTotal}
                                        isDark={isDark}
                                        billingSameAsShipping={billingSameAsShipping}
                                        setBillingSameAsShipping={setBillingSameAsShipping}
                                        checkoutAddress={checkoutAddress}
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
