'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconArrowLeft, IconCircleCheck, IconDownload, IconPackage } from '@tabler/icons-react';
import GrainedNoise from '@/components/GrainedNoise';
import AestheticBackground from '@/components/AestheticBackground';

import { getProductFile, FALLBACK_FILE_URL } from '@/lib/products';

type DownloadItem = { id: string; name: string; image?: string };

export default function DownloadsPage() {
    const [items] = useState<DownloadItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem('hyperslump-download-items');
            if (!stored) return [];
            const parsed = JSON.parse(stored) as unknown;
            return Array.isArray(parsed) ? parsed as DownloadItem[] : [];
        } catch {
            return [];
        }
    });
    const [email] = useState(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('hyperslump-download-email') || '';
        } catch {
            return '';
        }
    });
    const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

    const markDownloaded = (id: string) => {
        setDownloaded(prev => new Set(prev).add(id));
    };

    const allDownloaded = items.length > 0 && items.every(item => downloaded.has(item.id));

    if (items.length === 0) {
        return (
            <div className="flow-page-surface min-h-screen flex items-center justify-center font-sans bg-transparent text-foreground">
                <div className="text-center space-y-4">
                    <IconPackage size={40} stroke={1.8} className="mx-auto text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No downloads available</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity text-primary"
                    >
                        <IconArrowLeft size={14} stroke={2} />
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div data-lenis-prevent className="min-h-screen font-sans overflow-x-hidden bg-transparent text-foreground relative">
            {/* Aesthetic Background Layer (Standardized) */}
            <AestheticBackground showScanlines={true} scanlineOpacity="opacity-10" />

            <div className="relative z-10 max-w-[800px] mx-auto px-5 py-8 lg:py-16">


                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                    {/* Brand */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <IconArrowLeft size={14} stroke={2} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                        <span className="brand-logo-jacquard text-[2rem] leading-none tracking-tight text-foreground">
                            hyper$lump
                        </span>
                    </Link>

                </motion.div>

                {/* Download grid */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="space-y-4"
                >
                    {/* Section header */}
                    <div className="flex items-center justify-between px-1 border-b border-border pb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {items.length} {items.length === 1 ? 'file' : 'files'}
                        </span>
                        {allDownloaded && (
                            <span className="text-xs font-medium text-green-500">All downloaded ✓</span>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                        {items.map((item) => {
                            const fileInfo = getProductFile(item.id);
                            const fileUrl = fileInfo.url || FALLBACK_FILE_URL;
                            const done = downloaded.has(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card transition-all duration-200"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="w-[44px] h-[44px] rounded flex-shrink-0 flex items-center justify-center border border-border bg-foreground/5 dark:bg-foreground/5"
                                    >
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <IconPackage size={14} stroke={2} className="text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {done ? 'Success' : 'ZIP archive'}
                                        </p>
                                    </div>

                                    {/* Download button */}
                                    <a
                                        href={fileUrl}
                                        download
                                        onClick={() => markDownloaded(item.id)}
                                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 flex-shrink-0
                                            ${done
                                                ? 'bg-transparent text-green-500 border border-border'
                                                : 'bg-foreground text-background hover:bg-foreground/80'
                                            }`}
                                        title={done ? 'Downloaded' : 'Download file'}
                                    >
                                        {done ? (
                                            <IconCircleCheck size={18} stroke={2} />
                                        ) : (
                                            <IconDownload size={16} stroke={2} />
                                        )}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-10 space-y-6"
                >
                    {/* Stripe footer */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50">
                        <span>Powered by</span>
                        <span className="font-bold text-muted-foreground">stripe</span>
                        <span className="mx-1">|</span>
                        <a href="#" className="hover:underline">Terms</a>
                        <a href="#" className="hover:underline">Privacy</a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
