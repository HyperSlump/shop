'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconArrowLeft, IconCircleCheck, IconDownload, IconPackage, IconArrowRight, IconMail } from '@tabler/icons-react';
import { getProductFile, FALLBACK_FILE_URL } from '@/lib/products';
import { Product, useCart } from '@/components/CartProvider';

interface SuccessClientProps {
    downloads: any[];
    physical: any[];
    session: any;
    upsellItems?: Product[];
}

export default function SuccessClient({ downloads, physical, session, upsellItems = [] }: SuccessClientProps) {
    const { clearCart } = useCart();
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
    const [emailSubmitting, setEmailSubmitting] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);

    useEffect(() => {
        // Clear the cart on successful order
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        if (downloads.length > 0) {
            try {
                const itemsToStore = downloads.map(d => ({
                    id: d.id,
                    name: d.name,
                    image: d.image
                }));
                localStorage.setItem('hyperslump-download-items', JSON.stringify(itemsToStore));

                const email = session.customer_details?.email || session.receipt_email || session.metadata?.email;
                if (email) {
                    localStorage.setItem('hyperslump-download-email', email);
                }
            } catch (e) {
                console.error('Failed to save downloads', e);
            }
        }
    }, [downloads, session]);

    const markDownloaded = (id: string) => {
        setDownloaded(prev => new Set(prev).add(id));
    };

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailSubmitting(true);
        setTimeout(() => {
            setEmailSubmitting(false);
            setEmailSuccess(true);
        }, 1200);
    };

    const hasDigital = downloads.length > 0;
    const hasPhysical = physical.length > 0;
    const allDownloaded = hasDigital && downloads.every(item => downloaded.has(item.id));

    return (
        <div className="relative z-10 max-w-[800px] mx-auto px-5 py-8 lg:py-16">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                    <IconArrowLeft size={14} stroke={2} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                    <span className="brand-logo-jacquard text-[2.2rem] leading-none tracking-tight text-foreground">
                        hyper$lump
                    </span>
                </Link>
            </motion.div>

            {/* Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="space-y-16"
            >
                {/* Section header: Professional Greeting */}
                <div className="flex flex-col gap-1 px-1 border-b border-border pb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Thank you for your order.
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Order confirmation and receipt have been sent to <span className="text-foreground">{session.customer_details?.email || session.receipt_email || 'your email'}</span>.
                    </p>
                </div>

                {/* Digital Downloads Section */}
                {hasDigital && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Digital Assets
                            </h2>
                            {allDownloaded && (
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Saved to library ✓</span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {downloads.map((item) => {
                                const fileInfo = getProductFile(item.id);
                                const fileUrl = fileInfo.url || FALLBACK_FILE_URL;
                                const done = downloaded.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card/30 transition-all duration-200"
                                    >
                                        <div className="w-[44px] h-[44px] rounded-lg flex-shrink-0 flex items-center justify-center border border-border bg-foreground/[0.03]">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                            ) : (
                                                <IconPackage size={14} stroke={2} className="text-muted-foreground/40" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                {done ? 'DOWNLOADED' : 'READY TO DOWNLOAD'}
                                            </p>
                                        </div>
                                        <a
                                            href={fileUrl}
                                            download
                                            onClick={() => markDownloaded(item.id)}
                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 flex-shrink-0
                                                ${done
                                                    ? 'bg-transparent text-green-500 border border-border'
                                                    : 'bg-foreground text-background hover:bg-foreground/80'
                                                }`}
                                        >
                                            {done ? <IconCircleCheck size={18} /> : <IconDownload size={16} />}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Summary / Physical Items */}
                {hasPhysical && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Physical Order Summary
                            </h2>
                        </div>

                        <div className="space-y-1">
                            {physical.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-6 border-b border-border/40 last:border-0 group transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="relative w-16 h-16 bg-foreground/[0.03] border border-border/20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <IconPackage size={20} className="text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-foreground leading-tight mb-1.5">{item.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest bg-foreground/[0.03] px-1.5 py-0.5 rounded border border-border/10">Qty {item.quantity || 1}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest opacity-60">Merchandise Item</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[15px] font-bold text-foreground">${(item.amount || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Summary Totals - Minimalist Style */}
                            <div className="pt-8 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium uppercase tracking-tight">Subtotal</span>
                                    <span className="text-foreground font-mono">
                                        ${((session.amount_subtotal || (physical.reduce((s, i) => s + (i.amount || 0), 0) * 100 + downloads.reduce((s, i) => s + (i.amount || 0), 0) * 100)) / 100).toFixed(2)}
                                    </span>
                                </div>

                                {((session.total_details?.amount_shipping || 0) > 0) && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium uppercase tracking-tight">Shipping</span>
                                        <span className="text-foreground font-mono">${((session.total_details?.amount_shipping || 0) / 100).toFixed(2)}</span>
                                    </div>
                                )}

                                {((session.total_details?.amount_tax || 0) > 0) && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium uppercase tracking-tight">Tax</span>
                                        <span className="text-foreground font-mono">${((session.total_details?.amount_tax || 0) / 100).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="pt-6 mt-2 border-t border-border/40 flex items-center justify-between">
                                    <span className="text-[14px] font-bold text-foreground uppercase tracking-[0.2em]">Total</span>
                                    <span className="text-[24px] font-bold text-foreground font-mono">
                                        ${((session.amount_total || session.amount || 0) / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 px-2 border-l-2 border-primary/20 bg-primary/[0.02] py-4 rounded-r-xl">
                            <IconMail size={16} className="text-primary mt-0.5" />
                            <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
                                Tracking details will be transmitted to <span className="text-foreground font-medium">{session.customer_details?.email || 'your email address'}</span> once the shipment enters transit.
                            </p>
                        </div>
                    </div>
                )}


                {/* Newsletter Signup (Stripe Official Style) */}
                <div className="bg-foreground/[0.02] border border-border/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-sm text-center md:text-left">
                        <h3 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Stay updated</h3>
                        <p className="text-xs text-muted-foreground">Receive exclusive early access to data drops and physical artifacts.</p>
                    </div>
                    <form onSubmit={handleNewsletter} className="w-full md:w-auto flex items-center gap-2">
                        <div className="relative group flex-1 md:w-64">
                            <input
                                type="email"
                                placeholder="email@address.com"
                                required
                                className="w-full bg-background/50 border border-border/40 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg px-4 py-2.5 text-xs transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={emailSubmitting || emailSuccess}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                                ${emailSuccess
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                                    : 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]'
                                }`}
                        >
                            {emailSuccess ? 'Subscribed' : emailSubmitting ? '...' : (
                                <>Join <IconArrowRight size={14} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Professional Upsell Section */}
                {upsellItems.length > 0 && (
                    <div className="pt-8">
                        <div className="flex items-center justify-between mb-8 px-1">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                wear the collection
                            </h2>
                            <Link href="/" className="text-[11px] font-medium text-primary hover:underline">
                                Browse All Merch
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {upsellItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/product/${item.productId}`}
                                    className="group flex flex-col"
                                >
                                    <div className="aspect-square w-full mb-4 relative overflow-hidden rounded-2xl bg-foreground/[0.03] border border-border/20">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-muted-foreground/20">
                                                <IconPackage size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                        {item.name}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        ${item.amount.toFixed(2)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-20 pt-8 border-t border-border/40"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground/40 font-mono uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-1.5">
                        <span>Powered by</span>
                        <span className="font-bold text-muted-foreground">stripe</span>
                        <span className="mx-1">|</span>
                        <a href="#" className="hover:underline">Terms</a>
                        <a href="#" className="hover:underline">Privacy</a>
                    </div>
                    <span>© hyper$lump. Protocol secure.</span>
                </div>
            </motion.div>
        </div>
    );
}
