'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/components/CartProvider';
import CheckoutForm from '@/components/CheckoutForm';
import MockPageLayout from '@/components/MockPageLayout';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { cartTotal, cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
                body: JSON.stringify({
                    amount: cartTotal,
                    metadata: {
                        items: cart.map(item => item.name).join(', '),
                    }
                }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }

        return () => observer.disconnect();
    }, [cartTotal, cart]);

    const appearance = {
        theme: (theme === 'dark' ? 'night' : 'stripe') as any,
        variables: {
            colorPrimary: '#635BFF',
            colorBackground: theme === 'dark' ? '#161616' : '#ffffff',
            colorText: theme === 'dark' ? '#FAFAFA' : '#1A1F36',
            colorDanger: '#FF3B30',
            fontFamily: 'JetBrains Mono, monospace',
            spacingUnit: '4px',
            borderRadius: '0px',
        },
        rules: {
            '.Input': {
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(26, 31, 54, 0.1)',
                boxShadow: 'none',
                backgroundColor: theme === 'dark' ? '#0A0A0A' : '#FAFAFA',
            },
            '.Input:focus': {
                border: '1px solid #635BFF',
                boxShadow: '0 0 0 1px #635BFF',
            },
            '.Label': {
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: theme === 'dark' ? 'rgba(250, 250, 250, 0.5)' : 'rgba(26, 31, 54, 0.5)',
            },
            '.Tab': {
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(26, 31, 54, 0.1)',
                backgroundColor: theme === 'dark' ? '#161616' : '#ffffff',
            },
            '.Tab--selected': {
                border: '1px solid #635BFF',
            }
        }
    };

    const checkoutNode = (
        <div className="max-w-xl mx-auto w-full">
            <AnimatePresence mode="wait">
                {clientSecret ? (
                    <motion.div
                        key="checkout-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                            <CheckoutForm amount={cartTotal} />
                        </Elements>
                    </motion.div>
                ) : (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 space-y-4"
                    >
                        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing_Authorization_Layer...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <MockPageLayout
            title="SECURE_FULFILLMENT // PAYMENT"
            subtitle="Checkout"
            status="WAITING_FOR_AUTH"
            content="" // We pass the JSX elements below
        >
            {checkoutNode}
        </MockPageLayout>
    );
}

