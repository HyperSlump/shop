'use client';

import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

export default function CheckoutForm({ amount, isDark = true }: { amount: number; isDark?: boolean }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

        // This will only be reached if there's an immediate error
        // (e.g., card declined). Successful payments redirect.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "Payment declined.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const btnClasses = isDark
        ? 'bg-white text-black'
        : 'bg-[#1A1F36] text-white';

    const spinnerClasses = isDark
        ? 'border-black/20 border-t-black'
        : 'border-white/20 border-t-white';

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Stripe Payment Element */}
            <div className="space-y-1">
                <PaymentElement
                    id="payment-element"
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        },
                    }}
                />
            </div>

            {/* Error Message */}
            {message && (
                <div className="flex items-start gap-3 p-4 border border-red-500/20 bg-red-500/5">
                    <div className="w-1.5 h-1.5 bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                    <p className="font-mono text-[11px] text-red-400/90 leading-relaxed">
                        {message}
                    </p>
                </div>
            )}

            {/* Pay Button */}
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                type="submit"
                className={`w-full relative group overflow-hidden ${btnClasses} py-4 px-6 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-2 ${spinnerClasses} rounded-full animate-spin`} />
                            <span className="font-mono font-bold tracking-[0.3em] uppercase text-[11px]">
                                Processing...
                            </span>
                        </div>
                    ) : (
                        <span className="font-mono font-bold tracking-[0.3em] uppercase text-[11px]">
                            Pay ${amount.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </button>
        </form>
    );
}
