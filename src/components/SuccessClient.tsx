'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft, IconCircleCheck, IconDownload, IconPackage, IconArrowRight } from '@tabler/icons-react';
import { getProductFile, FALLBACK_FILE_URL } from '@/lib/products';
import { Product, useCart } from '@/components/CartProvider';
import { downloadAsset } from '@/lib/clientDownloads';
import PageBreadcrumb from '@/components/PageBreadcrumb';

interface SuccessClientProps {
    downloads: any[];
    physical: any[];
    session: any;
    upsellItems?: Product[];
}

export default function SuccessClient({ downloads, physical, session, upsellItems = [] }: SuccessClientProps) {
    const router = useRouter();
    const { clearCart } = useCart();
    const [hydratedDownloads, setHydratedDownloads] = useState<any[]>(downloads);
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
    const [downloading, setDownloading] = useState<Set<string>>(new Set());
    const [emailSubmitting, setEmailSubmitting] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);


    // Clear the cart exactly once after mount (avoids dependency array size churn + rerender loops)
    const clearedRef = React.useRef(false);
    useEffect(() => {
        if (clearedRef.current) return;
        clearedRef.current = true;
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        if (downloads.length > 0) {
            setHydratedDownloads(downloads);
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
        } else {
            if (physical.length > 0) {
                setHydratedDownloads([]);
                return;
            }
            // Free orders redirect instantly, Supabase might not have data yet. Fallback to localStorage:
            try {
                const stored = localStorage.getItem('hyperslump-download-items-complete');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setHydratedDownloads(parsed);
                    }
                }
            } catch (e) {
                console.error('Failed to parse fallback downloads', e);
            }
        }
    }, [downloads, session, physical.length]);

    const markDownloaded = (id: string) => {
        setDownloaded(prev => new Set(prev).add(id));
    };

    const handleDownload = async (item: { id: string; name: string }, fileUrl: string) => {
        setDownloading(prev => new Set(prev).add(item.id));
        markDownloaded(item.id);
        try {
            await downloadAsset(fileUrl, item.name);
        } finally {
            setDownloading(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailSubmitting(true);
        setTimeout(() => {
            setEmailSubmitting(false);
            setEmailSuccess(true);
        }, 1200);
    };

    const hasDigital = hydratedDownloads.length > 0;
    const allDownloaded = hasDigital && hydratedDownloads.every(item => downloaded.has(item.id));

    const handleHomeNav = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();
        router.push('/');

        window.setTimeout(() => {
            if (window.location.pathname !== '/') {
                window.location.assign('/');
            }
        }, 250);
    }, [router]);

    const getProductHref = React.useCallback((item: Product) => {
        // Prefer the full price id (pf_... or price_...) because it maps directly to the product route
        const targetId = item.id || item.productId;
        return `/product/${encodeURIComponent(targetId)}`;
    }, []);

    return (
        <div className="relative z-10 max-w-[800px] mx-auto px-5 py-8 lg:py-16">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <PageBreadcrumb
                    items={[
                        { label: 'store', href: '/' },
                        { label: 'success' },
                    ]}
                    className="mb-6"
                />

                <div className="inline-flex items-center gap-3 mb-10 group relative z-[130] pointer-events-auto">
                    <Link
                        href="/"
                        onClick={handleHomeNav}
                        aria-label="Back to store"
                        className="inline-flex items-center"
                    >
                        <IconArrowLeft size={14} stroke={2} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                        href="/"
                        onClick={handleHomeNav}
                        className="brand-logo-jacquard text-[2.2rem] leading-none tracking-tight text-foreground hover:text-primary transition-colors"
                    >
                        hyper$lump
                    </Link>
                </div>
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
                            {hydratedDownloads.map((item) => {
                                const fileInfo = getProductFile(item.id);
                                const fileUrl = fileInfo.url || FALLBACK_FILE_URL;
                                const done = downloaded.has(item.id);
                                const isDownloading = downloading.has(item.id);
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
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(item, fileUrl)}
                                            disabled={isDownloading}
                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 flex-shrink-0
                                                ${done
                                                    ? 'bg-transparent text-green-500 border border-border'
                                                    : 'bg-foreground text-background hover:bg-foreground/80'
                                                } ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {done ? <IconCircleCheck size={18} /> : <IconDownload size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Physical order summary removed per request */}


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
                            className={`px-6 py-2.5 h-[42px] rounded-md font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-all flex items-center gap-2
                                ${emailSuccess
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                                    : 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]'
                                }`}
                        >
                            {emailSuccess ? 'subscribed' : emailSubmitting ? '...' : (
                                <>join protocol <IconArrowRight size={14} /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Professional Upsell Section */}
                {
                    upsellItems.length > 0 && (
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
                                        href={getProductHref(item)}
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
                    )
                }
            </motion.div >

            {/* Footer removed per request */}
        </div >
    );
}
