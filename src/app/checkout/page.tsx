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
        <div className="max-w-6xl mx-auto w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* 1. Order Summary */}
                <div className="space-y-10 animate-fade-in">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary/60 font-mono text-[10px] tracking-[0.3em]">
                            <span className="w-2 h-2 bg-primary animate-pulse" />
                            SYS_LOC // ORDER_MANIFEST
                        </div>
                        <h2 className="text-4xl font-gothic tracking-tighter lowercase">review manifest</h2>
                    </div>

                    <div className="border border-primary/10 bg-primary/[0.02] p-8 space-y-6">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-start py-4 border-b border-primary/5 last:border-0">
                                    <div className="space-y-1">
                                        <p className="font-mono text-xs uppercase tracking-widest text-primary">{item.name}</p>
                                        <p className="font-mono text-[10px] opacity-40 uppercase">QTY: {item.quantity}</p>
                                    </div>
                                    <span className="font-mono text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-primary/20 space-y-2">
                            <div className="flex justify-between font-mono text-[10px] opacity-40 uppercase tracking-widest">
                                <span>SUBTOTAL_VAL</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px] opacity-40 uppercase tracking-widest">
                                <span>TAX_ENCRYPTION</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between font-mono text-sm pt-4 border-t border-primary/10">
                                <span className="uppercase tracking-[0.3em] font-bold">TOTAL_DUE</span>
                                <span className="text-primary font-bold">${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-3 opacity-30">
                            <div className="h-[1px] flex-1 bg-primary/20" />
                            <span className="font-mono text-[8px] uppercase tracking-[0.5em]">End_of_Manifest</span>
                            <div className="h-[1px] flex-1 bg-primary/20" />
                        </div>
                    </div>
                </div>

                {/* 2. Stripe Payment Form */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {clientSecret ? (
                            <motion.div
                                key="checkout-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="bg-foreground/[0.02] dark:bg-white/[0.02] border border-primary/10 p-8 md:p-12 relative"
                            >
                                <div className="absolute top-0 right-0 p-3 flex gap-1">
                                    <div className="w-1 h-1 bg-primary/40" />
                                    <div className="w-1 h-3 bg-primary/20" />
                                </div>
                                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                    <CheckoutForm amount={cartTotal} />
                                </Elements>
                            </motion.div>
                        ) : cartTotal === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border border-alert/20 bg-alert/5 p-12 text-center space-y-4"
                            >
                                <div className="text-alert font-mono text-xs tracking-widest">[ERROR]: CART_EMPTY</div>
                                <p className="text-[10px] font-mono opacity-40 uppercase">No items found in active session buffer.</p>
                                <a href="/" className="inline-block border border-primary px-6 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all">Return to Terminal</a>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-24 space-y-6"
                            >
                                <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                                <div className="text-center space-y-2">
                                    <span className="block font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing_Authorization_Layer...</span>
                                    <span className="block font-mono text-[8px] opacity-20 uppercase tracking-[0.2em]">Contacting_Stripe_Fulfillment_Hub</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
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

