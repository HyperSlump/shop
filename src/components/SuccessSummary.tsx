'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SuccessSummaryProps {
    downloads: any[];
    totalAmount: number;
    sessionId: string;
}

export default function SuccessSummary({ downloads, totalAmount, sessionId }: SuccessSummaryProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Persist downloads for paid users so they can access /downloads later
        if (downloads.length > 0) {
            try {
                // Determine format expected by DownloadsPage: { id, name, image? }
                // success/page.tsx constructs downloads with: id, name, url, label, amount, image
                const itemsToStore = downloads.map(d => ({
                    id: d.id,
                    name: d.name,
                    image: d.image
                }));
                localStorage.setItem('hyperslump-download-items', JSON.stringify(itemsToStore));
            } catch (e) {
                console.error('Failed to save downloads', e);
            }
        }
    }, [downloads]);

    return (
        <div className="space-y-10">
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between border-b border-white/5 pb-6 pt-4 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-white/90">Asset Summary</span>
                        </div>
                        <ChevronDown
                            size={12}
                            className={`text-white/20 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    <span className="font-mono text-sm font-bold text-white">${totalAmount.toFixed(2)}</span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden border-b border-white/5"
                        >
                            <div className="py-6 space-y-2">
                                {downloads.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4 py-2 opacity-60">
                                        <span className="font-mono text-[10px] uppercase tracking-wider truncate max-w-[200px]">{item.name}</span>
                                        <span className="font-mono text-[10px]">${item.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Brand / Header (Hidden on Mobile) */}
            <div className="hidden lg:block mb-12">
                <Link href="/" className="text-4xl font-display tracking-tighter text-white hover:text-primary transition-all inline-block mb-2">h$</Link>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                    <CheckCircle2 size={12} className="text-green-500" />
                    Transaction Completed
                </div>
            </div>

            {/* Desktop Line Items List (Static) */}
            <div className="hidden lg:block space-y-0">
                {downloads.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 py-4 border-b border-white/5 last:border-0">
                        <div className="w-14 h-14 bg-white/[0.03] border border-white/10 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden">

                            <div className="font-mono text-[10px] text-white/20 uppercase">
                                {String(i + 1).padStart(2, '0')}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-mono text-[10px] font-bold text-white uppercase tracking-[0.15em] mb-1 truncate">
                                    {item.name}
                                </p>
                                <p className="font-mono text-[8px] text-white/30 uppercase tracking-[0.1em]">
                                    Digital Asset • Qty 1
                                </p>
                            </div>
                            <span className="font-mono text-[11px] text-white/70 flex-shrink-0">
                                ${item.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals Section */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-between font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
                    <span>Subtotal</span>
                    <span className="text-white/60">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
                    <span>Tax</span>
                    <span className="text-white/60">—</span>
                </div>
                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                    <span className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em] pb-1">Total Paid</span>
                    <span className="font-mono text-4xl font-bold text-white tracking-tighter">
                        ${totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Footer Reference */}
            <div className="mt-12 pt-8 border-t border-white/5 opacity-20 hidden lg:block">
                <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em]">
                    <span>Ref: {sessionId.slice(-12).toUpperCase()}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
