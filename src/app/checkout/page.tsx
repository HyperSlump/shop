'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart, type Product } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import ShippingForm, { type ShippingAddress } from '@/components/ShippingForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconChevronDown, IconLock, IconTruck, IconAlertTriangle, IconTrash, IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import AestheticBackground from '@/components/AestheticBackground';
import { buildPrintfulShippingItems } from '@/lib/printful/shippingPayload';

interface ShippingRateOption {
    id: string;
    name: string;
    rate: string;
    currency: string;
    min_delivery_days?: number;
    max_delivery_days?: number;
}

const VARIANT_SIZE_SET = new Set([
    'xxs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl',
    'small', 'medium', 'large', 'extra large', 'one size', 'os', 'osfa',
]);

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
        updatePhysicalVariant,
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
    const [taxCalculationId, setTaxCalculationId] = useState<string>('');
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [checkoutAddress, setCheckoutAddress] = useState<ShippingAddress | null>(null);
    const [isIntentShippingSynced, setIsIntentShippingSynced] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setShippingError] = useState<string | null>(null);
    const [productsOpen, setProductsOpen] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [hasSeededEstimate, setHasSeededEstimate] = useState(false);
    const [showInvalidQuantityMessage, setShowInvalidQuantityMessage] = useState(false);
    const [showDoneEditingTooltip, setShowDoneEditingTooltip] = useState(false);
    const [doneEditingTooltipNonce, setDoneEditingTooltipNonce] = useState(0);
    const lastQuotedAddressKeyRef = useRef('');
    const pendingAddressQuoteKeyRef = useRef('');
    const quoteSnapshotRef = useRef({ selectedShippingId: '', shippingCost: 0, taxCost: 0 });
    const taxCostRef = useRef(0);
    const taxCalculationIdRef = useRef('');
    const refreshIntentSeqRef = useRef(0);

    const hasPhysicalItems = cart.some(item => item.metadata?.type === 'PHYSICAL');
    const invalidPhysicalItemIds = cart
        .filter((item) => item.metadata?.type === 'PHYSICAL' && (item.quantity ?? 1) <= 0)
        .map((item) => item.id);
    const hasInvalidPhysicalQuantities = invalidPhysicalItemIds.length > 0;
    const hasCheckoutEligibleItems = cart.some(
        (item) => item.metadata?.type !== 'PHYSICAL' || (item.quantity ?? 1) > 0
    );
    const requiresOrderEditBeforeCheckout = cart.length > 0 && !hasCheckoutEligibleItems;
    const isFreeOrder = cartTotal === 0 && cart.length > 0 && hasCheckoutEligibleItems;

    const getVariantName = useCallback((item: Product): string | null => {
        const fromMetadata = item.metadata?.variant_name?.trim();
        if (fromMetadata) return fromMetadata;

        const selectedVariantId = item.metadata?.variant_id || item.selectedVariantId;
        const selected = item.variants?.find((variant) => String(variant.id) === String(selectedVariantId));
        if (selected?.name) return selected.name;

        if (item.variants && item.variants.length > 0) {
            return item.variants[0].name;
        }

        return null;
    }, []);

    const parseVariantDescriptor = useCallback((item: Product, variantName: string): { color: string; size: string; raw: string } => {
        const raw = variantName.split(' - ').pop()?.trim() || variantName.trim();
        const parts = raw.split('/').map((value) => value.trim()).filter(Boolean);

        if (parts.length > 1 && item.name) {
            const normalizedName = item.name.toLowerCase().replace(/\s+/g, '');
            const normalizedHead = parts[0].toLowerCase().replace(/\s+/g, '');
            if (normalizedHead === normalizedName) {
                parts.shift();
            }
        }

        let size = '';
        const colorParts: string[] = [];

        parts.forEach((part) => {
            if (VARIANT_SIZE_SET.has(part.toLowerCase())) {
                size = part;
            } else {
                colorParts.push(part);
            }
        });

        return {
            color: colorParts.join(' / '),
            size,
            raw,
        };
    }, []);

    const formatVariantDescriptor = useCallback((item: Product, variantName: string): string => {
        const parsed = parseVariantDescriptor(item, variantName);

        if (parsed.color && parsed.size) return `${parsed.color.toLowerCase()} | ${parsed.size}`;
        if (parsed.color) return parsed.color.toLowerCase();
        if (parsed.size) return parsed.size;
        return parsed.raw;
    }, [parseVariantDescriptor]);

    const getItemDescriptor = useCallback((item: Product): string => {
        if (item.metadata?.type !== 'PHYSICAL') return 'Digital download';

        const variantName = getVariantName(item);
        if (variantName) return formatVariantDescriptor(item, variantName);

        const fallbackVariantId = item.metadata?.variant_id || item.selectedVariantId;
        if (fallbackVariantId) return `Variant ${fallbackVariantId}`;

        return 'Physical item';
    }, [formatVariantDescriptor, getVariantName]);

    const renderPhysicalEditControls = useCallback((item: Product) => {
        const selectedVariantId = item.metadata?.variant_id || item.selectedVariantId || String(item.variants?.[0]?.id || '');
        const currentQuantity = item.quantity ?? 1;
        const isZeroQuantity = currentQuantity <= 0;
        const shouldHighlightQuantity = showInvalidQuantityMessage && isZeroQuantity;
        const variants = item.variants ?? [];
        const hasVariants = variants.length > 0;

        // Parse all variants into color/size descriptors
        const parsed = variants.map(v => ({
            id: String(v.id),
            ...parseVariantDescriptor(item, v.name),
        }));

        // Extract unique colors and sizes
        const uniqueColors = [...new Set(parsed.map(p => p.color).filter(Boolean))];
        const uniqueSizes = [...new Set(parsed.map(p => p.size).filter(Boolean))];
        const hasColors = uniqueColors.length > 0;
        const hasSizes = uniqueSizes.length > 0;

        // Determine current selection
        const currentParsed = parsed.find(p => p.id === String(selectedVariantId));
        const currentColor = currentParsed?.color || uniqueColors[0] || '';
        const currentSize = currentParsed?.size || uniqueSizes[0] || '';

        // Handler: find the variant matching the new color + current size (or vice versa)
        const handleColorChange = (newColor: string) => {
            const match = parsed.find(p => p.color === newColor && p.size === currentSize)
                || parsed.find(p => p.color === newColor);
            if (match) updatePhysicalVariant(item.id, match.id);
        };
        const handleSizeChange = (newSize: string) => {
            const match = parsed.find(p => p.size === newSize && p.color === currentColor)
                || parsed.find(p => p.size === newSize);
            if (match) updatePhysicalVariant(item.id, match.id);
        };


        return (
            <div className="mt-2.5 w-full">
                <div className="flex items-end gap-2 flex-wrap">
                    {hasVariants && (hasColors || hasSizes) ? (
                        <>
                            {hasColors && (
                                <div className="space-y-1">
                                    <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted/70">
                                        Color
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={currentColor}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="h-[30px] pl-2 pr-7 border border-border/60 rounded-md bg-card/70 text-foreground font-mono text-[10px] uppercase tracking-[0.08em] appearance-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                                        >
                                            {uniqueColors.map(color => (
                                                <option key={color} value={color}>{color}</option>
                                            ))}
                                        </select>
                                        <IconChevronDown
                                            size={10}
                                            stroke={2}
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                                        />
                                    </div>
                                </div>
                            )}
                            {hasSizes && (
                                <div className="space-y-1">
                                    <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted/70">
                                        Size
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={currentSize}
                                            onChange={(e) => handleSizeChange(e.target.value)}
                                            className="h-[30px] pl-2 pr-7 border border-border/60 rounded-md bg-card/70 text-foreground font-mono text-[10px] uppercase tracking-[0.08em] appearance-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                                        >
                                            {uniqueSizes.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <IconChevronDown
                                            size={10}
                                            stroke={2}
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : hasVariants ? (
                        <div className="space-y-1">
                            <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted/70">
                                Variant
                            </p>
                            <div className="relative">
                                <select
                                    value={String(selectedVariantId)}
                                    onChange={(e) => updatePhysicalVariant(item.id, e.target.value)}
                                    className="h-[30px] pl-2 pr-7 border border-border/60 rounded-md bg-card/70 text-foreground font-mono text-[10px] uppercase tracking-[0.08em] appearance-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                                >
                                    {variants.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {formatVariantDescriptor(item, v.name)}
                                        </option>
                                    ))}
                                </select>
                                <IconChevronDown
                                    size={10}
                                    stroke={2}
                                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="space-y-1">
                        <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted/70">
                            Qty
                        </p>
                        <div
                            className={`inline-flex h-[30px] items-center gap-1.5 rounded-md px-2 transition-colors ${shouldHighlightQuantity
                                ? 'border border-alert/60 bg-alert/10'
                                : 'border border-border/60 bg-card/70'}`}
                        >
                            <button
                                onClick={() => updateQuantity(item.id, Math.max(0, currentQuantity - 1))}
                                disabled={currentQuantity <= 0}
                                className={`transition-colors ${currentQuantity <= 0 ? 'text-muted/40 cursor-not-allowed' : 'text-muted hover:text-foreground'}`}
                            >
                                <IconMinus size={10} stroke={2} />
                            </button>
                            <span className="text-[10px] font-mono font-medium w-3 text-center text-foreground tabular-nums">{currentQuantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, currentQuantity + 1)}
                                disabled={currentQuantity >= 10}
                                className={`text-muted transition-colors ${currentQuantity >= 10 ? 'opacity-20 cursor-not-allowed' : 'hover:text-foreground'}`}
                            >
                                <IconPlus size={10} stroke={2} />
                            </button>
                        </div>
                    </div>
                </div>

                {isZeroQuantity && (
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 h-[30px] px-3 bg-alert/5 border border-alert/20 text-alert/80 hover:bg-alert/10 hover:border-alert/40 transition-all rounded-md inline-flex items-center gap-2"
                    >
                        <IconTrash size={12} stroke={2} />
                        <span className="text-[9px] font-mono uppercase tracking-wider">Remove</span>
                    </button>
                )}
            </div>
        );
    }, [formatVariantDescriptor, parseVariantDescriptor, removeFromCart, showInvalidQuantityMessage, updatePhysicalVariant, updateQuantity]);

    const refreshIntent = useCallback(async (
        currentShipping = 0,
        address: ShippingAddress | null = null,
        shippingId?: string,
        taxAmount: number = taxCostRef.current,
        taxCalcId: string = taxCalculationIdRef.current
    ) => {
        const requestSeq = ++refreshIntentSeqRef.current;
        try {
            const recipientData = address ? {
                name: `${address.firstName} ${address.lastName}`.trim(),
                address1: address.address1,
                city: address.city,
                state: address.state_code,
                zip: address.zip,
                country_code: address.country_code
            } : null;
            const hasShippingPayload = Boolean(
                recipientData?.address1 &&
                recipientData?.city &&
                recipientData?.zip &&
                recipientData?.country_code &&
                shippingId
            );
            if (hasPhysicalItems && !hasShippingPayload) {
                setIsIntentShippingSynced(false);
            }

            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shippingAmount: currentShipping,
                    taxAmount: taxAmount,
                    shippingId,
                    recipient: recipientData,
                    paymentIntentId: paymentIntentId || undefined,
                    taxCalculationId: taxCalcId || undefined,
                    uiMode: isDark ? 'dark' : 'light',
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (requestSeq !== refreshIntentSeqRef.current) {
                return;
            }
            if (data.freeOrder) {
                // Zero-cost order — email already sent, redirect to success page
                // Success page clears the cart on mount, so no need to do it here.
                window.location.href = `/success?session_id=${data.sessionId}`;
                return;
            }
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.id);
                // Unconditionally update taxCost from the server response
                // This ensures it resets to 0 if the server says it's 0 (e.g. non-taxable address)
                setTaxCost(data.amount_tax || 0);
                setTaxCalculationId(data.tax_calculation_id || '');
                if (hasPhysicalItems) {
                    setIsIntentShippingSynced(hasShippingPayload);
                }
            }
        } catch (err: any) {
            console.error('Intent error:', err);
            setError(err.message);
            if (hasPhysicalItems) {
                setIsIntentShippingSynced(false);
            }
        }
    }, [cart, paymentIntentId, isDark, hasPhysicalItems]);

    useEffect(() => {
        if (cart.length > 0 && hasCheckoutEligibleItems && !clientSecret && !isFreeOrder) {
            refreshIntent(0);
        }
    }, [cart.length, clientSecret, hasCheckoutEligibleItems, refreshIntent, isFreeOrder]);

    useEffect(() => {
        setHasSeededEstimate(false);
    }, [cart]);

    useEffect(() => {
        lastQuotedAddressKeyRef.current = '';
        pendingAddressQuoteKeyRef.current = '';
    }, [cart]);

    useEffect(() => {
        quoteSnapshotRef.current = { selectedShippingId, shippingCost, taxCost };
    }, [selectedShippingId, shippingCost, taxCost]);

    useEffect(() => {
        taxCostRef.current = taxCost;
    }, [taxCost]);

    useEffect(() => {
        taxCalculationIdRef.current = taxCalculationId;
    }, [taxCalculationId]);

    useEffect(() => {
        if (hasPhysicalItems) return;
        setIsIntentShippingSynced(false);
        setTaxCalculationId('');
        setShippingCost(0);
        setTaxCost(0);
    }, [hasPhysicalItems]);

    useEffect(() => {
        if (!hasPhysicalItems) return;
        if (checkoutAddress?.address1) return;
        if (hasSeededEstimate) return;
        if (estimatedShipping === null && estimatedTax === null) return;

        const seededShipping = estimatedShipping ?? 0;
        const seededTax = estimatedTax ?? 0;

        setShippingCost(seededShipping);
        setTaxCost(seededTax);
        setTaxCalculationId('');
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

    useEffect(() => {
        if (!hasInvalidPhysicalQuantities && showInvalidQuantityMessage) {
            setShowInvalidQuantityMessage(false);
        }
    }, [hasInvalidPhysicalQuantities, showInvalidQuantityMessage]);

    useEffect(() => {
        if (!requiresOrderEditBeforeCheckout) return;

        setShippingRateOptions([]);
        setSelectedShippingId('');
        setShippingCost(0);
        setTaxCost(0);
        setTaxCalculationId('');
        setClientSecret('');
        setPaymentIntentId('');
    }, [requiresOrderEditBeforeCheckout]);

    useEffect(() => {
        if (!showDoneEditingTooltip) return;

        const timer = window.setTimeout(() => {
            setShowDoneEditingTooltip(false);
        }, 2400);

        return () => window.clearTimeout(timer);
    }, [showDoneEditingTooltip, doneEditingTooltipNonce]);

    const handleInvalidQuantityAttempt = useCallback(() => {
        setShowInvalidQuantityMessage(true);
        setIsEditingOrder(true);
        if (cart.length > 1) {
            setProductsOpen(true);
        }
    }, [cart.length]);

    const handleEditOrderToggle = useCallback(() => {
        if (isEditingOrder && hasInvalidPhysicalQuantities) {
            handleInvalidQuantityAttempt();
            setShowDoneEditingTooltip(true);
            setDoneEditingTooltipNonce((prev) => prev + 1);
            return;
        }

        setShowDoneEditingTooltip(false);
        setIsEditingOrder((prev) => !prev);
    }, [handleInvalidQuantityAttempt, hasInvalidPhysicalQuantities, isEditingOrder]);

    const handleEditOrderRequiredAction = useCallback(() => {
        setIsEditingOrder(true);
        setShowInvalidQuantityMessage(true);
        if (cart.length > 1) {
            setProductsOpen(true);
        }
    }, [cart.length]);

    const getAddressQuoteKey = useCallback((address: ShippingAddress): string => {
        return [
            (address.address1 || '').trim().toLowerCase(),
            (address.city || '').trim().toLowerCase(),
            (address.state_code || '').trim().toUpperCase(),
            (address.country_code || '').trim().toUpperCase(),
            (address.zip || '').trim().toUpperCase(),
        ].join('|');
    }, []);

    const handleAddressChange = useCallback(async (addressValue: ShippingAddress) => {
        if (!hasPhysicalItems) return;
        const normalizedAddress: ShippingAddress = {
            ...addressValue,
            address1: (addressValue.address1 || '').trim(),
            address2: (addressValue.address2 || '').trim(),
            city: (addressValue.city || '').trim(),
            state_code: (addressValue.state_code || '').trim().toUpperCase(),
            zip: (addressValue.zip || '').trim(),
            country_code: (addressValue.country_code || '').toUpperCase(),
        };
        setCheckoutAddress(normalizedAddress);
        const quoteSnapshot = quoteSnapshotRef.current;
        const hasExistingQuote = Boolean(
            quoteSnapshot.selectedShippingId ||
            quoteSnapshot.shippingCost > 0 ||
            quoteSnapshot.taxCost > 0
        );

        // Clear rates if address is incomplete
        if (!normalizedAddress.address1 || !normalizedAddress.city || !normalizedAddress.country_code || !normalizedAddress.zip) {
            setShippingRateOptions([]);
            setSelectedShippingId('');
            setIsIntentShippingSynced(false);
            if (!hasExistingQuote) {
                setShippingCost(0);
                setTaxCost(0);
            }
            setTaxCalculationId('');
            setHasSeededEstimate(false);
            setShippingError(null);
            setIsRefreshingQuote(false);
            lastQuotedAddressKeyRef.current = '';
            pendingAddressQuoteKeyRef.current = '';
            return;
        }

        const nextAddressQuoteKey = getAddressQuoteKey(normalizedAddress);
        if (
            (nextAddressQuoteKey === lastQuotedAddressKeyRef.current && hasExistingQuote) ||
            nextAddressQuoteKey === pendingAddressQuoteKeyRef.current
        ) {
            return;
        }

        const shippingItems = buildPrintfulShippingItems(cart);
        if (shippingItems.length === 0) {
            setShippingRateOptions([]);
            setSelectedShippingId('');
            setIsIntentShippingSynced(false);
            setShippingCost(0);
            setTaxCost(0);
            setTaxCalculationId('');
            setHasSeededEstimate(false);
            setShippingError('Unable to calculate shipping for the selected items.');
            setIsRefreshingQuote(false);
            lastQuotedAddressKeyRef.current = '';
            pendingAddressQuoteKeyRef.current = '';
            return;
        }

        pendingAddressQuoteKeyRef.current = nextAddressQuoteKey;
        setIsCalculating(true);
        setIsIntentShippingSynced(false);
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
                    items: shippingItems
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
                    setTaxCalculationId('');
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
                    const nextTaxAmount = typeof data.tax === 'number' ? data.tax : 0;
                    setTaxCost(nextTaxAmount);
                    setTaxCalculationId('');
                    await refreshIntent(cost, normalizedAddress, cheapest.id, nextTaxAmount, '');
                    lastQuotedAddressKeyRef.current = nextAddressQuoteKey;
                }
            } else {
                const errorText = await res.text();
                let errorData: any = null;
                let errorMessage = res.statusText || 'Failed to calculate shipping';
                if (errorText) {
                    try {
                        errorData = JSON.parse(errorText);
                        if (errorData?.error) {
                            errorMessage = errorData.error;
                        }
                    } catch {
                        errorMessage = errorText;
                    }
                }
                console.error('>>> [CHECKOUT_PAGE] API Error:', {
                    status: res.status,
                    statusText: res.statusText,
                    body: errorData ?? errorText
                });
                if (hasExistingQuote) {
                    setShippingError('Unable to refresh shipping quote. Showing last known quote.');
                } else {
                    setShippingError(errorMessage || 'Failed to calculate shipping');
                    setShippingRateOptions([]);
                    setSelectedShippingId('');
                    setShippingCost(0);
                    setTaxCost(0);
                    setTaxCalculationId('');
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
                setTaxCalculationId('');
            }
        } finally {
            if (pendingAddressQuoteKeyRef.current === nextAddressQuoteKey) {
                pendingAddressQuoteKeyRef.current = '';
            }
            setIsCalculating(false);
            setIsRefreshingQuote(false);
        }
    }, [cart, getAddressQuoteKey, hasPhysicalItems, refreshIntent]);


    const handleRateSelect = async (rate: ShippingRateOption) => {
        if (isCalculating || rate.id === selectedShippingId) return;
        setIsCalculating(true);
        setIsIntentShippingSynced(false);
        try {
            setSelectedShippingId(rate.id);
            const cost = parseFloat(rate.rate);
            setShippingCost(cost);
            const currentAddress = checkoutAddress;

            if (
                currentAddress &&
                (currentAddress.address1 || '').trim() &&
                (currentAddress.city || '').trim() &&
                (currentAddress.country_code || '').trim() &&
                (currentAddress.zip || '').trim()
            ) {
                const nextTaxAmount = taxCostRef.current;
                setTaxCost(nextTaxAmount);
                setTaxCalculationId('');
                await refreshIntent(cost, currentAddress, rate.id, nextTaxAmount, '');
            } else {
                setTaxCost(0);
                setTaxCalculationId('');
                await refreshIntent(cost, currentAddress, rate.id, 0);
            }
        } finally {
            setIsCalculating(false);
        }
    };

    const finalTotal = cartTotal + shippingCost + taxCost;
    const hasCompleteShippingAddress = Boolean(
        checkoutAddress &&
        (checkoutAddress.firstName || '').trim() &&
        (checkoutAddress.lastName || '').trim() &&
        (checkoutAddress.address1 || '').trim() &&
        (checkoutAddress.city || '').trim() &&
        (checkoutAddress.state_code || '').trim() &&
        (checkoutAddress.country_code || '').trim() &&
        (checkoutAddress.zip || '').trim()
    );
    const shippingReadyForPayment = !hasPhysicalItems || (
        hasCompleteShippingAddress &&
        Boolean(selectedShippingId) &&
        !isCalculating &&
        !isEstimatingShipping &&
        isIntentShippingSynced
    );
    const showingPrefillEstimate = hasPhysicalItems && !checkoutAddress?.address1 && (hasSeededEstimate || isEstimatingShipping);
    const hasQuoteContext = Boolean(checkoutAddress?.address1 || hasSeededEstimate);
    const shippingDisplayValue = (isCalculating && !isRefreshingQuote)
        ? '--'
        : shippingCost > 0
            ? `$${shippingCost.toFixed(2)}`
            : hasQuoteContext
                ? '$0.00'
                : '--';
    const taxDisplayValue = (isCalculating && !isRefreshingQuote)
        ? '--'
        : taxCost > 0
            ? `$${taxCost.toFixed(2)}`
            : hasQuoteContext
                ? '$0.00'
                : '--';

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
                <div className="order-first lg:order-none w-full lg:w-[44%] drawer-surface dark:bg-[#0c0d0f] border-b lg:border-b-0 border-border relative overflow-hidden">
                    <div className="flex flex-col w-full max-w-[500px] ml-auto px-6 lg:px-12 py-8 lg:py-12">
                        <div className="flex-shrink-0 mb-6 lg:mb-8">
                            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                                <IconArrowLeft size={14} stroke={2} className="text-muted group-hover:-translate-x-0.5 transition-transform" />
                                <span
                                    className="brand-logo-jacquard text-[2rem] leading-none tracking-tight text-foreground"
                                    style={{ fontFamily: 'var(--font-heading), "Jacquard 24", "Jacquard 12", system-ui' }}
                                >
                                    h$
                                </span>
                                <span className="text-[9px] bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                    Test
                                </span>
                            </Link>

                            <div className="flex items-end justify-between w-full">
                                <p className="font-sans text-[40px] font-semibold tracking-tight leading-none text-foreground tabular-nums">
                                    ${finalTotal.toFixed(2)}
                                </p>
                                {cart.length > 0 && (
                                    <div className="relative pb-1">
                                        <button
                                            onClick={handleEditOrderToggle}
                                            className="font-sans text-xs text-muted hover:underline cursor-pointer transition-colors hover:text-foreground"
                                        >
                                            {isEditingOrder ? 'Done Editing' : 'Edit Order'}
                                        </button>
                                        <AnimatePresence>
                                            {showDoneEditingTooltip && isEditingOrder && hasInvalidPhysicalQuantities && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 4 }}
                                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                                    className="pointer-events-none absolute right-0 -top-9 whitespace-nowrap rounded-md border border-alert/35 bg-background/95 px-2.5 py-1.5 text-[10px] font-medium text-alert shadow-[0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur-sm"
                                                >
                                                    Add quantity above 0 or remove item.
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
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
                                            <Link
                                                href={`/product/${encodeURIComponent(cart[0].productId || cart[0].id)}`}
                                                className="block text-sm font-medium leading-snug text-foreground truncate hover:underline"
                                            >
                                                {cart[0].name}
                                            </Link>
                                            <p className="text-[10px] mt-0.5 text-muted font-mono uppercase tracking-[0.12em] truncate">
                                                {getItemDescriptor(cart[0])}
                                            </p>

                                            {isEditingOrder ? (
                                                <div className="mt-2">
                                                    {cart[0].metadata?.type === 'PHYSICAL' ? (
                                                        renderPhysicalEditControls(cart[0])
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
                                        <span className="text-sm font-semibold font-sans tabular-nums flex-shrink-0 text-foreground pt-0.5 text-right w-[96px]">
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
                                                                        <Link
                                                                            href={`/product/${encodeURIComponent(item.productId || item.id)}`}
                                                                            className="block text-sm font-medium leading-snug text-foreground truncate hover:underline"
                                                                        >
                                                                            {item.name}
                                                                        </Link>
                                                                        <p className="text-[10px] mt-0.5 text-muted font-mono uppercase tracking-[0.12em] truncate">
                                                                            {getItemDescriptor(item)}
                                                                        </p>

                                                                        {isEditingOrder ? (
                                                                            <div className="mt-2">
                                                                                {item.metadata?.type === 'PHYSICAL' ? (
                                                                                    renderPhysicalEditControls(item)
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
                                                                    <span className="text-sm font-semibold font-sans tabular-nums flex-shrink-0 text-foreground pt-0.5 text-right w-[96px]">
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

                        {showInvalidQuantityMessage && hasInvalidPhysicalQuantities && (
                            <div className="flex-shrink-0 mt-3 mb-4 flex items-start gap-2 rounded-md border border-alert/30 bg-alert/10 px-3 py-2.5">
                                <IconAlertTriangle size={14} stroke={2} className="mt-0.5 text-alert shrink-0" />
                                <p className="text-xs text-alert/90">
                                    Please choose a quantity above 0 or remove highlighted item(s) before checkout.
                                </p>
                            </div>
                        )}

                        <div className="flex-shrink-0 font-sans">
                            <div className="pt-4 space-y-3 border-t border-border">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Subtotal</span>
                                    <span className="text-foreground font-sans font-semibold tabular-nums text-right min-w-[96px]">${cartTotal.toFixed(2)}</span>
                                </div>
                                {hasPhysicalItems && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Shipping</span>
                                        <span className="text-foreground font-sans font-semibold tabular-nums text-right min-w-[96px]">
                                            {isEstimatingShipping && !hasSeededEstimate && !checkoutAddress?.address1
                                                ? '--'
                                                : shippingDisplayValue}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Tax</span>
                                    <span className="text-foreground font-sans font-semibold tabular-nums text-right min-w-[96px]">
                                        {isEstimatingShipping && !hasSeededEstimate && !checkoutAddress?.address1
                                            ? '--'
                                            : taxDisplayValue}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-4 font-semibold border-t border-border">
                                    <span className="text-foreground">Total due today</span>
                                    <span className="text-foreground font-sans font-semibold tabular-nums text-right min-w-[96px]">${finalTotal.toFixed(2)}</span>
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
                    className="order-last lg:order-none flex-1 bg-background relative z-20"
                    style={{
                        boxShadow: isDark
                            ? '-12px 0 48px -12px rgba(0,0,0,0.5)'
                            : '-12px 0 32px -12px rgba(50,20,30,0.12)'
                    }}
                >
                    <div className="w-full max-w-[520px] mr-auto px-5 lg:px-12 py-8 lg:py-12">
                        {requiresOrderEditBeforeCheckout ? (
                            <div className="py-20">
                                <div className="rounded-md border border-alert/30 bg-alert/10 px-4 py-4">
                                    <p className="font-sans text-sm font-medium text-alert">
                                        Please edit order to add items before checkout.
                                    </p>
                                    <button
                                        onClick={handleEditOrderRequiredAction}
                                        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-alert hover:underline cursor-pointer"
                                    >
                                        Edit order
                                    </button>
                                </div>
                            </div>
                        ) : isFreeOrder ? (
                            <FreeOrderPanel cart={cart} isDark={isDark} />
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
                                        requiresShipping={hasPhysicalItems}
                                        shippingReady={shippingReadyForPayment}
                                        hasInvalidPhysicalQuantities={hasInvalidPhysicalQuantities}
                                        onInvalidQuantityAttempt={handleInvalidQuantityAttempt}
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

function FreeOrderPanel({ cart, isDark }: { cart: Product[]; isDark: boolean }) {
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

        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shippingAmount: 0,
                    taxAmount: 0,
                    email,
                    uiMode: isDark ? 'dark' : 'light',
                }),
            });

            const data = await response.json();
            if (data.freeOrder && data.sessionId) {
                if (data.downloads) {
                    localStorage.setItem('hyperslump-download-items-complete', JSON.stringify(data.downloads));
                }
                router.push(`/success?session_id=${data.sessionId}`);
            } else {
                // Fallback if API didn't return freeOrder
                router.push('/downloads');
            }
        } catch (err) {
            console.error('Free order submit error:', err);
            router.push('/downloads');
        }
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
                            preparing assets
                        </span>
                    ) : (
                        'complete order'
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
