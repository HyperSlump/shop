'use client';

import MatrixSpace from './MatrixSpace';
import EncryptText from './EncryptText';

interface HeroSchemaProps {
    productCount: number;
}

export default function HeroSchema({ productCount }: HeroSchemaProps) {
    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] px-4 pt-4 pb-2 md:px-12 md:pt-6 md:pb-2 border-b-2 border-primary/20 animate-fade-in">
            {/* MAIN CONTAINER */}
            <div className="max-w-[1400px] mx-auto relative flex flex-col">

                {/* 1. BRANDING SECTION (NO BOX) */}
                <div className="relative self-start mb-2">
                    <h1 className="font-gothic text-6xl md:text-8xl tracking-tighter lowercase leading-[0.8] mb-4 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                        hyper$lump
                    </h1>
                    <div className="relative max-w-2xl">
                        <EncryptText />
                    </div>
                </div>

                {/* 2. SECONDARY DATA AREA (PULLED TIGHT) */}
                <div className="relative ml-0 md:ml-4 flex flex-col md:flex-row items-start md:items-end gap-8 border-l-2 border-primary/20 pl-6 md:pl-10 py-1 transition-all duration-300">
                    {/* Horizontal separator line */}
                    <div className="absolute top-0 left-0 w-32 h-[1px] bg-primary/30" />

                    {/* Left Data Column */}
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="space-y-2">
                            <div className="h-8 w-full md:w-48 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/20 opacity-30" />
                                <div className="absolute top-1 left-2 font-mono text-[6px] opacity-40">SIGNAL_STREAM_01</div>
                            </div>
                            <div className="h-8 w-full md:w-48 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                <div className="absolute top-1 left-2 font-mono text-[6px] opacity-40">CARRIER_REF_99</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Data Strip */}
                    <div className="flex-1 flex flex-col gap-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 min-w-[200px]">
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Sys: V.4.0</span>
                            <span>[ OK ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-1">
                            <span>Cortex: Link</span>
                            <span className="text-primary opacity-60">ACTIVE</span>
                        </div>
                    </div>

                    {/* 3. CATALOG MODULE (Integrated and smaller) */}
                    <div className="self-end md:self-auto bg-primary/5 px-6 py-3 border-2 border-primary/40 backdrop-blur-sm">
                        <div className="text-[9px] uppercase font-bold tracking-[0.3em] text-primary mb-1 text-right opacity-70">
                            Current Catalog_
                        </div>
                        <div className="text-4xl md:text-6xl font-gothic leading-none text-right">
                            {productCount} Items
                        </div>
                    </div>
                </div>

                {/* Decorative Tech Legend (Pulled closer) */}
                <div className="mt-4 flex items-center justify-between font-mono text-[7px] opacity-20 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-4">
                        <span>Antifreeze_Synthesis_Hub</span>
                        <div className="h-[1px] w-8 bg-primary/30" />
                        <span>Build: 01A</span>
                    </div>
                    <span>©2026 HYPER</span>
                </div>
            </div>
        </section>
    );
}
