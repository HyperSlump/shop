'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromoCarousel from './PromoCarousel';

export default function HeroSchema() {
    const [coordinates, setCoordinates] = useState("40.7128° N, 74.0060° W");

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const lat = (40.7128 + (e.clientX / window.innerWidth - 0.5) * 0.1).toFixed(4);
            const lng = (74.0060 + (e.clientY / window.innerHeight - 0.5) * 0.1).toFixed(4);
            setCoordinates(`${lat}° N, ${lng}° W`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="relative w-full bg-[var(--background)] animate-fade-in px-0 pt-0 pb-0 h-[calc(50vh-40px)] min-h-[300px]">
            <div className="w-full h-full relative flex flex-col justify-between p-4 md:px-6 md:py-8 lg:px-10 lg:py-12">
                {/* 1. BRANDING SECTION */}
                <div className="relative w-full flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="font-gothic text-4xl md:text-5xl tracking-tight lowercase leading-none drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                            <Link href="/" className="hover:text-primary transition-colors duration-300" data-cursor-invert="true">
                                hyper$lump
                            </Link>
                        </h1>
                    </div>

                    <div className="hidden md:flex flex-col items-end font-mono text-[9px] opacity-40 tracking-wider uppercase gap-0.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="opacity-40">COORD:</span>
                            <span
                                onClick={() => navigator.clipboard.writeText(coordinates)}
                                className="text-primary opacity-100 w-[120px] text-right font-mono tabular-nums transition-all duration-300 cursor-crosshair hover:bg-primary/20 hover:text-white select-all"
                            >
                                {coordinates}
                            </span>
                        </div>
                        <div className="h-[1px] w-full bg-primary/20 my-1" />
                        <span>TERMINAL_READY</span>
                        <span>LINK_ESTABLISHED</span>
                        <div className="h-[1px] w-full bg-primary/20 my-1" />
                        <span className="text-primary opacity-60">VERSION: 4.5.BETA</span>
                        <span className="opacity-30">LAST UPDATE: 24.03.18</span>
                    </div>
                </div>

                {/* Promotional Carousel - Re-positioned and Centered on the "Red Line" Axis */}
                <div className="absolute left-1/2 top-[180px] -translate-x-1/2 -translate-y-1/2 z-50 hidden lg:block">
                    <PromoCarousel />
                </div>

                {/* 2. SECONDARY DATA AREA */}
                <div className="relative w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-1 py-0 transition-all duration-300">
                    <div className="flex flex-col gap-2 font-mono text-[9px] uppercase tracking-[0.3em] opacity-30 min-w-[250px]">
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Sys: V.4.0.ALPHA</span>
                            <span>[ OK ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Cortex: Link</span>
                            <span className="text-primary opacity-60">ACTIVE_STREAM</span>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end justify-end pb-1 opacity-40">
                        <span className="font-mono text-[8px] text-primary uppercase tracking-tighter">Nav_Module.v2</span>
                    </div>
                </div>

                {/* Decorative Tech Legend */}
                <div className="mt-8 flex items-center justify-between font-mono text-[8px] opacity-20 uppercase tracking-[0.4em] w-full border-t border-primary/10 pt-4">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 pulse-slow">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Live_System_Feed
                        </span>
                        <div className="h-[1px] w-16 bg-primary/30" />
                        <span>Build_ID: 01A-X99</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>©2026 HYPER$LUMP_IND_GLOBAL</span>
                        <div className="h-[1px] w-16 bg-primary/30" />
                        <span>ENCRYPTED_SIGNAL_STRENGTH: 100%</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
            `}</style>
        </section>
    );
}
