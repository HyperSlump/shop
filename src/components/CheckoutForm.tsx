'use client';

import React, { useState } from 'react';
import {
    PaymentElement,
    LinkAuthenticationElement,
    ExpressCheckoutElement,
    AddressElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { IconLock, IconTruck } from '@tabler/icons-react';

interface CheckoutFormProps {
    amount: number;
    isDark?: boolean;
    hasPhysicalItems?: boolean;
    onAddressChange?: (value: any) => void;
    isCalculating?: boolean;
}

export default function CheckoutForm({
    amount,
    isDark = true,
    hasPhysicalItems = false,
    onAddressChange,
    isCalculating = false
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const mutedText = 'text-muted';
    const labelText = 'text-foreground';
    const divider = 'bg-border';
    const errorBox = 'bg-alert/10 border border-alert/30 text-alert';
    const submitButton = 'bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.24)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(0,0,0,0.34)]';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);
        setMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
            },
        });

        if (error?.type === 'card_error' || error?.type === 'validation_error') {
            setMessage(error.message ?? 'Payment declined.');
        } else if (error) {
            setMessage('An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    const onExpressCheckoutConfirm = async () => {
        if (!stripe || !elements) return;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
            },
        });

        if (error) {
            setMessage(error.message ?? 'Payment failed.');
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="font-sans antialiased">
            <div className="mb-8">
                <ExpressCheckoutElement
                    onConfirm={onExpressCheckoutConfirm}
                    options={{
                        buttonType: {
                            applePay: 'buy',
                            googlePay: 'buy',
                        },
                        buttonTheme: {
                            applePay: isDark ? 'white-outline' : 'black',
                            googlePay: isDark ? 'white' : 'black',
                        }
                    }}
                />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className={`flex-1 h-px ${divider}`} />
                <span className={`text-[13px] whitespace-nowrap font-medium ${mutedText}`}>
                    Or pay another way
                </span>
                <div className={`flex-1 h-px ${divider}`} />
            </div>

            <div className="mb-8">
                <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                    Contact information
                </label>
                <LinkAuthenticationElement id="link-authentication-element" />
            </div>

            {hasPhysicalItems && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <label className={`block text-sm font-medium ${labelText}`}>
                            Shipping address
                        </label>
                        {isCalculating && (
                            <span className="text-[10px] text-primary animate-pulse font-mono uppercase tracking-widest flex items-center gap-1">
                                <IconTruck size={12} /> Updating rates...
                            </span>
                        )}
                    </div>
                    <AddressElement
                        options={{ mode: 'shipping', allowedCountries: ['US', 'CA', 'GB', 'AU'] }}
                        onChange={(e) => {
                            if (e.complete && onAddressChange) onAddressChange(e.value);
                        }}
                    />
                </div>
            )}

            <div className="mb-8">
                <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                    Payment details
                </label>
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${errorBox}`}>
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                type="submit"
                className={`group relative w-full h-[48px] rounded-md font-medium text-[15px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${submitButton}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    <span>Pay ${amount.toFixed(2)}</span>
                )}
            </button>

            <div className={`mt-8 flex items-center justify-center gap-1.5 text-xs ${mutedText}`}>
                <IconLock size={12} stroke={2.25} className="opacity-70" />
                <span>Secured by <strong className={labelText}>stripe</strong></span>
            </div>
        </form>
    );
}
