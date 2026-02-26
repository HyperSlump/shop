'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PaymentElement,
    LinkAuthenticationElement,
    ExpressCheckoutElement,
    AddressElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { IconLock } from '@tabler/icons-react';

interface CheckoutFormProps {
    amount: number;
    billingSameAsShipping: boolean;
    setBillingSameAsShipping: (val: boolean) => void;
    checkoutAddress: any | null;
    isDark?: boolean;
}

export default function CheckoutForm({
    amount,
    billingSameAsShipping,
    setBillingSameAsShipping,
    checkoutAddress,
    isDark = true,
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


            <div className="mb-8">
                <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                    Payment details
                </label>
                <PaymentElement
                    id="payment-element"
                    options={{
                        layout: 'tabs',
                        defaultValues: billingSameAsShipping && checkoutAddress ? {
                            billingDetails: {
                                name: `${checkoutAddress.firstName} ${checkoutAddress.lastName}`.trim(),
                                address: {
                                    line1: checkoutAddress.address1,
                                    line2: checkoutAddress.address2 || undefined,
                                    city: checkoutAddress.city,
                                    state: checkoutAddress.state_code,
                                    postal_code: checkoutAddress.zip,
                                    country: checkoutAddress.country_code,
                                }
                            }
                        } : undefined
                    }}
                />

                <div className="mt-4 pt-4 border-t border-border/50">
                    <label className="flex items-center gap-2.5 cursor-pointer group mb-4">
                        <input
                            type="checkbox"
                            checked={billingSameAsShipping}
                            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                            className="w-4 h-4 shrink-0 rounded-[4px] border border-border bg-background text-primary focus:ring-primary focus:ring-offset-1 focus:ring-offset-background accent-primary cursor-pointer transition-none"
                        />
                        <span className={`text-sm font-medium ${labelText} group-hover:opacity-80 transition-opacity select-none`}>
                            Billing same as shipping
                        </span>
                    </label>

                    <AnimatePresence>
                        {!billingSameAsShipping && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="mt-6 pt-6 pb-2 border-t border-border/40 overflow-hidden"
                            >
                                <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                                    Billing address
                                </label>
                                <AddressElement
                                    options={{
                                        mode: 'billing',
                                        defaultValues: checkoutAddress ? {
                                            name: `${checkoutAddress.firstName} ${checkoutAddress.lastName}`.trim(),
                                            address: {
                                                line1: checkoutAddress.address1,
                                                line2: checkoutAddress.address2 || '',
                                                city: checkoutAddress.city,
                                                state: checkoutAddress.state_code,
                                                postal_code: checkoutAddress.zip,
                                                country: checkoutAddress.country_code,
                                            }
                                        } : undefined
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${errorBox}`}>
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                type="submit"
                className={`group relative w-full h-[48px] rounded-md font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${submitButton}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                        processing payment
                    </span>
                ) : (
                    <span>complete order // ${amount.toFixed(2)}</span>
                )}
            </button>

            <div className={`mt-8 flex items-center justify-center gap-1.5 text-xs ${mutedText}`}>
                <IconLock size={12} stroke={2.25} className="opacity-70" />
                <span>Secured by <strong className={labelText}>stripe</strong></span>
            </div>
        </form>
    );
}
