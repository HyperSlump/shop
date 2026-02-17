'use client';

import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

export default function CheckoutForm({ amount }: { amount: number }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />

            {message && (
                <div id="payment-message" className="p-4 border border-alert/20 bg-alert/5 text-alert font-mono text-[10px] uppercase tracking-widest animate-pulse">
                    [ALERT]: {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full relative group overflow-hidden border-2 border-primary bg-primary py-4 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-black font-mono font-bold tracking-[0.4em] uppercase text-xs">
                        {isLoading ? "PROCESING_TRANSACTION..." : `AUTHORIZE_PAYMENT_//_$${amount.toFixed(2)}`}
                    </span>
                    {!isLoading && <div className="w-2 h-2 bg-black animate-pulse" />}
                </div>

                {/* Button Hover Glow */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <div className="flex items-center justify-between font-mono text-[8px] opacity-30 uppercase tracking-[0.2em] pt-4">
                <span>Signal_Encrypted: TLS_1.3</span>
                <span>Stripe_Secure_Shield</span>
            </div>
        </form>
    );
}
