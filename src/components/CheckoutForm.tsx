'use client';

import React, { useState } from 'react';
import {
    PaymentElement,
    LinkAuthenticationElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
    amount: number;
    isDark?: boolean;
}

export default function CheckoutForm({ amount, isDark = true }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /* ── Form submission ── */
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

    /* ── Express checkout (Apple Pay / Google Pay / Link) ── */
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
        <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="font-sans antialiased"
        >
            {/* ── Express Checkout ── */}
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

            {/* ── Divider ── */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[13px] whitespace-nowrap text-muted-foreground font-medium">
                    Or pay another way
                </span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* ── Email / Contact ── */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-foreground">
                    Contact information
                </label>
                <LinkAuthenticationElement id="link-authentication-element" />
            </div>

            {/* ── Payment ── */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-foreground">
                    Payment details
                </label>
                <PaymentElement
                    id="payment-element"
                    options={{ layout: 'tabs' }}
                />
            </div>

            {/* ── Error ── */}
            {message && (
                <div className="mb-6 p-4 rounded-md text-sm bg-alert/10 border border-alert/20 text-alert font-medium">
                    {message}
                </div>
            )}

            {/* ── Pay Button ── */}
            <button
                disabled={isLoading || !stripe || !elements}
                type="submit"
                className="group relative w-full h-[48px] rounded-md font-medium text-[15px] transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                         bg-primary text-primary-foreground 
                         shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(99,91,255,0.4)]
                         hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(99,91,255,0.5)]
                         hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                        Processing…
                    </span>
                ) : (
                    <span>Pay ${amount.toFixed(2)}</span>
                )}
            </button>

            {/* ── Footer ── */}
            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secured by <strong className="text-foreground font-semibold">stripe</strong></span>
            </div>
        </form>
    );
}
