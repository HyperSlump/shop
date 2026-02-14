'use client';

import { useEffect, useState } from 'react';
import EncryptText from './EncryptText';

interface HeroSchemaProps {
    productCount: number;
}

export default function HeroSchema({ productCount }: HeroSchemaProps) {
    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] px-6 py-12 md:px-12 md:py-20 border-b-2 border-primary/20">
            {/* BACKGROUND DECORATION LAYER */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
                {/* Crosshair corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary" />

                {/* Grid underlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto min-h-[400px] md:min-h-[500px]">
                {/* 1. TOP HEADER SECTION */}
                <div className="flex flex-col mb-12">
                    <h1 className="font-gothic text-7xl md:text-9xl tracking-tighter lowercase leading-[0.8] mb-6 animate-fade-in">
                        hyper$lump
                    </h1>
                    <div className="max-w-xl">
                        <EncryptText />
                    </div>
                </div>

                {/* 2. SCHEMATIC FRAME AREA */}
                <div className="relative mt-8 group">
                    {/* The Primary Yellow Frame (SVG for precision) */}
                    <svg
                        viewBox="0 0 1000 400"
                        fill="none"
                        className="w-full h-auto text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] animate-fade-in delay-200"
                        preserveAspectRatio="none"
                    >
                        {/* More accurate stepped path based on the user sketch */}
                        <path
                            d="M 10 100 
                               L 360 100 
                               L 360 40 
                               L 980 40 
                               L 980 280 
                               L 810 280 
                               L 810 380 
                               L 10 380 
                               Z"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                        />

                        {/* Internal vertical dashed divider */}
                        <line
                            x1="430" y1="60" x2="430" y2="360"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="4 8"
                            className="opacity-40"
                        />

                        {/* Middle horizontal separator lines (Left of divider) */}
                        <line x1="40" y1="180" x2="330" y2="180" stroke="currentColor" strokeWidth="1" className="opacity-20" />
                        <line x1="40" y1="210" x2="330" y2="210" stroke="currentColor" strokeWidth="1" className="opacity-20" />
                        <line x1="40" y1="240" x2="330" y2="240" stroke="currentColor" strokeWidth="1" className="opacity-20" />

                        {/* Scanning horizontal lines (Right side) with staggering animation */}
                        {[70, 100, 130, 160, 190, 220, 250].map((y, i) => (
                            <line
                                key={i}
                                x1="460" y1={y} x2="940" y2={y}
                                stroke="currentColor"
                                strokeWidth="2"
                                className="opacity-30 animate-scan"
                                style={{ animationDelay: `${i * 200}ms` }}
                            />
                        ))}

                        {/* Step Sequencer bars (Bottom left) */}
                        {[40, 70, 110, 150, 180, 210, 250, 280, 310, 340].map((x, i) => (
                            <line
                                key={i}
                                x1={x} y1="340" x2={x} y2="380"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="opacity-60"
                            />
                        ))}
                        <rect x="20" y="340" width="340" height="30" stroke="currentColor" strokeWidth="1.5" />
                    </svg>

                    {/* OVERLAY ELEMENTS (Relative to the SVG frame) */}

                    {/* Scanning Text / Data labels (Right) */}
                    <div className="absolute top-[15%] right-[5%] w-[50%] hidden md:flex flex-col gap-4 font-mono text-[8px] uppercase tracking-widest opacity-40">
                        <div className="flex justify-between border-b border-primary/20 pb-1">
                            <span>Signal_Process // ALPHA</span>
                            <span>[ 84.2% ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/20 pb-1">
                            <span>Buffer_Depth // DELTA</span>
                            <span>[ 120ms ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/20 pb-1">
                            <span>Cortex_Link // STATUS</span>
                            <span className="text-primary animate-pulse">ACTIVE</span>
                        </div>
                    </div>

                    {/* Oscillo-visualizer simulation (Left area) */}
                    <div className="absolute top-[35%] left-[5%] w-[30%] hidden md:flex flex-col gap-8">
                        <div className="h-12 w-full border border-primary/20 relative overflow-hidden bg-primary/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent w-[200%] -translate-x-full animate-[shimmer_3s_infinite]" />
                        </div>
                        <div className="h-12 w-full border border-primary/20 relative overflow-hidden bg-primary/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent w-[200%] -translate-x-full animate-[shimmer_4s_infinite_reverse]" />
                        </div>
                    </div>

                    {/* 3. CURRENT CATALOG WIDGET (Bottom Right) */}
                    <div className="absolute bottom-[-10px] right-2 md:right-8 bg-[var(--background)] px-6 py-4 border-l-2 border-t-2 border-primary animate-fade-in delay-500">
                        <div className="text-[10px] uppercase font-bold tracking-[0.4em] text-primary mb-1 text-right">
                            Current Catalog
                        </div>
                        <div className="text-5xl md:text-7xl font-gothic leading-none text-right">
                            {productCount} Items
                        </div>
                    </div>
                </div>

                {/* Decorative Tech Tag */}
                <div className="mt-20 flex items-center gap-4 font-mono text-[9px] opacity-30 uppercase tracking-[0.5em]">
                    <span>SYS_ARCH: MODULAR_V4</span>
                    <div className="h-[1px] w-20 bg-primary/40" />
                    <span>OS: HYPER_KERNL_PRO</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                @keyframes scan {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.6; }
                }
                .animate-scan {
                    animation: scan 4s infinite ease-in-out;
                }
            `}</style>
        </section>
    );
}
