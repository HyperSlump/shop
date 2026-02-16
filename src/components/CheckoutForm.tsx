'use client';

import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';

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
            <div className="space-y-2">
                <div className="flex justify-between items-end border-b border-primary/20 pb-2">
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.3em]">Payment_Authorization</span>
                    <span className="font-mono text-xl font-bold text-primary">${amount.toFixed(2)}</span>
                </div>
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="group/pay relative w-full bg-primary text-primary-foreground font-bold uppercase py-5 overflow-hidden transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 text-base tracking-widest"
            >
                <motion.div
                    className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/pay:translate-x-[100%] transition-transform duration-700 ease-in-out"
                />
                {isLoading ? (
                    <span className="flex items-center gap-3 animate-pulse">
                        <span className="material-icons animate-spin text-sm">refresh</span>
                        PROCESSING_VAULT_ACQUIRING...
                    </span>
                ) : (
                    <span id="button-text" className="flex items-center gap-3">
                        AUTHORIZE_SECURE_TRANSFER <span className="material-icons text-base">lock</span>
                    </span>
                )}
            </button>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-alert/30 bg-alert/5 text-alert font-mono text-[11px] uppercase tracking-widest text-center"
                >
                    [ERROR]: {message}
                </motion.div>
            )}

            <div className="text-center opacity-30 font-mono text-[9px] uppercase tracking-[0.3em] flex flex-col gap-1">
                <span>Stripe_Encrypted_Link_Node_77x</span>
                <span>AES-256_Fulfillment_Protocol</span>
            </div>
        </form>
    );
}
