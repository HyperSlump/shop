'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MockPageLayoutProps {
    title: string;
    subtitle: string;
    content: string;
    status: string;
    children?: React.ReactNode;
}

export default function MockPageLayout({ title, subtitle, content, status, children }: MockPageLayoutProps) {
    return (
        <div className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10">
            <div className="w-full space-y-10">
                {/* Header System Line */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-1 pt-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tighter leading-none uppercase">
                            {subtitle}
                        </h1>
                    </div>

                </div>

                {/* 2. Primary Content Grid - Matching Product Page */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    {/* LEFT COLUMN: Visual Diagnostic Frame */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Technical Metadata Box */}
                        <div className="p-5 border border-primary/10 bg-black/20 flex flex-col gap-4 font-mono rounded">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { k: 'ENCRYPTION', v: 'AES-256' },
                                    { k: 'PROTOCOL', v: 'QUIC/HTTP3' },
                                    { k: 'ACCESS', v: 'V.4_AUTH' },
                                    { k: 'SERVER', v: 'HYPER-CORE' }
                                ].map((spec) => (
                                    <div key={spec.k} className="flex flex-col gap-1">
                                        <span className="text-[8px] text-primary/30 uppercase tracking-tighter">{spec.k}</span>
                                        <span className="text-[11px] text-foreground/70 uppercase truncate">{spec.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Content & Informational Flow */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-6">
                            {content && (
                                <p className="font-mono text-base md:text-lg leading-relaxed opacity-90 max-w-prose whitespace-pre-wrap">
                                    {content}
                                </p>
                            )}

                            {children}

                            <div className="mt-8 border-l-2 border-primary/20 pl-6 py-4 space-y-4">
                                <h3 className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">
                                    SYSTEM_QUERY_LOG //
                                </h3>
                                <p className="font-mono text-sm text-foreground/60 leading-relaxed italic">
                                    Documenting the architectural shifts and sonic exploration of the hyper$lump collective.
                                    This data is periodically purged and re-indexed to ensure maximum signal clarity across all nodes.
                                </p>
                            </div>
                        </div>


                        <div className="pt-8 border-t border-primary/5">
                            <div className="mt-8 flex flex-wrap gap-4 opacity-30 text-[9px] font-mono uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-primary rounded-full" />
                                    <span>Signal_Online</span>
                                </div>
                                <span>LAST_UPDATE: {new Date().toLocaleDateString()}</span>
                                <span>STATUS: {status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
