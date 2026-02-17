'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/components/CartProvider';
import MockPageLayout from '@/components/MockPageLayout';
import CheckoutForm from '@/components/CheckoutForm';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { cartTotal, cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const checkTheme = () => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        };

        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            setError('Stripe configuration missing. Please verify environment variables.');
        }

        if (cartTotal > 0 && cart.length > 0) {
            console.log('[CLIENT] Requesting Payment Intent for cart...');
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`API_ERROR: ${res.status} - ${text}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log('[CLIENT] Payment Intent created successfully');
                    setClientSecret(data.clientSecret);
                })
                .catch(err => {
                    console.error('[CLIENT] Checkout Initialization Failed:', err);
                    setError(err.message || 'Failed to initialize payment gateway.');
                });
        }

        return () => observer.disconnect();
    }, [cartTotal, cart]);

    const appearance = {
        theme: (theme === 'dark' ? 'night' : 'stripe') as any,
        variables: {
            colorPrimary: '#635BFF',
            colorBackground: theme === 'dark' ? '#0A0A0A' : '#ffffff',
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
                                        <p className="font-mono text-[10px] opacity-40 uppercase">ITEM_ID: {item.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <span className="font-mono text-xs">${item.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-primary/20 space-y-2">
                            <div className="flex justify-between font-mono text-[10px] opacity-40 uppercase tracking-widest">
                                <span>SUBTOTAL_VAL</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-mono text-sm pt-4 border-t border-primary/10 leading-none">
                                <span className="uppercase tracking-[0.3em] font-bold">TOTAL_DUE</span>
                                <span className="text-primary font-bold">${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border border-red-500/20 bg-red-500/5 p-12 text-center space-y-4"
                            >
                                <div className="text-red-500 font-mono text-xs tracking-widest">[CRITICAL_ERROR]: PAY_GATEWAY_FAIL</div>
                                <p className="text-[10px] font-mono opacity-40 uppercase">{error}</p>
                                <button onClick={() => window.location.reload()} className="border border-primary px-6 py-2 font-mono text-[10px] uppercase">RETRY</button>
                            </motion.div>
                        ) : (clientSecret && stripePromise) ? (
                            <motion.div
                                key="checkout-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-foreground/[0.02] dark:bg-white/[0.02] border border-primary/10 p-6 md:p-10 relative"
                            >
                                <div className="absolute top-0 right-0 p-3 flex gap-1 z-10">
                                    <div className="w-1 h-3 bg-primary/20" />
                                </div>
                                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                    <CheckoutForm amount={cartTotal} />
                                </Elements>
                            </motion.div>
                        ) : cartTotal === 0 ? (
                            <motion.div key="empty" className="border border-alert/20 bg-alert/5 p-12 text-center">
                                <span className="font-mono text-[10px] opacity-40 uppercase tracking-[0.4em]">Cart_Empty_Status</span>
                            </motion.div>
                        ) : (
                            <motion.div key="loader" className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing_Authorization_Layer...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    return (
        <MockPageLayout title="SECURE_FULFILLMENT // PAYMENT" subtitle="Checkout" status="WAITING_FOR_AUTH" content="">
            {checkoutNode}
        </MockPageLayout>
    );
}

