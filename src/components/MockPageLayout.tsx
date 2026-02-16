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
        <div className="flex-1 w-full px-4 md:px-7 lg:px-8 py-10 animate-fade-in">
            <div className="w-full space-y-10">
                {/* 0. MINIMAL RETURN NAV */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-primary/70 hover:text-primary transition-all group w-fit"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-mono text-[12px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">back</span>
                </Link>

                {/* 1. Header System Line */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-primary/60 font-mono text-[10px] tracking-[0.3em]">
                            <span className="w-2 h-2 bg-primary animate-pulse" />
                            SYS_LOC // {title.split('//')[1]?.trim()?.toUpperCase() || title.toUpperCase()}
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-gothic tracking-tighter leading-none lowercase">
                            {subtitle}
                        </h1>
                    </div>
                    <div className="flex flex-col items-start md:items-end font-mono text-[11px] opacity-40">
                        <p className="text-primary opacity-60 uppercase mb-1">STATUS: {status}</p>
                        <p>NODE_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </div>
                </div>

                {/* 2. Primary Content Grid - Matching Product Page */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    {/* LEFT COLUMN: Visual Diagnostic Frame */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="relative aspect-square overflow-hidden group bg-foreground/5 dark:bg-white/5 border border-primary/10 flex items-center justify-center p-12">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative flex flex-col items-center gap-6">
                                <span className="material-icons text-[140px] text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-1000">terminal</span>
                                <div className="font-mono text-[10px] tracking-[0.5em] opacity-30 uppercase animate-pulse">DIRECTORY_INDEXING...</div>
                            </div>
                            {/* Scanning Line Animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] animate-scan" />
                        </div>

                        {/* Technical Metadata Box */}
                        <div className="p-5 border border-primary/10 bg-black/20 flex flex-col gap-4 font-mono">
                            <div className="text-[10px] text-primary/40 flex justify-between uppercase border-b border-primary/10 pb-2">
                                <span>Core_System_Data</span>
                                <span>[Secure]</span>
                            </div>
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

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </div >
    );
}
