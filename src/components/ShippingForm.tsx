'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconTruck, IconChevronRight, IconLoader2 } from '@tabler/icons-react';

interface ShippingAddress {
    name: string;
    address1: string;
    city: string;
    state: string;
    country_code: string;
    zip: string;
}

interface ShippingRate {
    id: string;
    name: string;
    rate: string;
    currency: string;
}

interface ShippingFormProps {
    onRatesFetched: (rates: ShippingRate[], address: ShippingAddress) => void;
    isDark: boolean;
}

export default function ShippingForm({ onRatesFetched, isDark }: ShippingFormProps) {
    const [address, setAddress] = useState<ShippingAddress>({
        name: '',
        address1: '',
        city: '',
        state: '',
        country_code: 'US',
        zip: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // In a real app, we'd get the actual cart from context, 
            // but for simplicity we'll let the checkout page handle the cart items mapping
            // or we can pass items as props. 
            // For now, we'll just trigger the parent fetch logic.
            const cart = JSON.parse(localStorage.getItem('hyperslump-cart') || '[]');

            const response = await fetch('/api/printful/shipping-rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient: address, items: cart }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shipping rates');
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            onRatesFetched(data.rates, address);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full h-11 px-3 rounded-md text-sm outline-none transition-all duration-150 border ${isDark
            ? 'bg-card border-border/40 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm text-foreground placeholder:text-muted/50'
            : 'bg-white border-border focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm text-foreground'
        }`;

    const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-muted mb-2 font-mono";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <IconTruck size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Shipping Details</h2>
            </div>

            {error && (
                <div className="p-3 rounded bg-alert/10 border border-alert/30 text-alert text-xs font-medium">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className={inputClass}
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelClass}>Address</label>
                    <input
                        required
                        type="text"
                        placeholder="123 Street Name"
                        className={inputClass}
                        value={address.address1}
                        onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>City</label>
                        <input
                            required
                            type="text"
                            placeholder="Los Angeles"
                            className={inputClass}
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>State / Province</label>
                        <input
                            required
                            type="text"
                            placeholder="CA"
                            className={inputClass}
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Country Code (ISO)</label>
                        <input
                            required
                            type="text"
                            placeholder="US"
                            maxLength={2}
                            className={inputClass}
                            value={address.country_code}
                            onChange={(e) => setAddress({ ...address, country_code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>ZIP / Postal Code</label>
                        <input
                            required
                            type="text"
                            placeholder="90210"
                            className={inputClass}
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-3 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded border border-primary text-primary hover:bg-primary/10 disabled:opacity-50"
            >
                {loading ? (
                    <IconLoader2 size={18} className="animate-spin" />
                ) : (
                    <>
                        <span>CALCULATE_SHIPPING</span>
                        <IconChevronRight size={16} />
                    </>
                )}
            </button>
        </form>
    );
}
