'use client';

import MatrixSpace from './MatrixSpace';

interface HeroSchemaProps {
    productCount: number;
}

export default function HeroSchema({ productCount }: HeroSchemaProps) {
    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] px-4 pt-4 pb-2 md:px-8 md:pt-6 md:pb-2 border-b-2 border-primary/20 animate-fade-in">
            {/* MAIN CONTAINER - ALIGNED WITH PRODUCT GRID EDGES */}
            <div className="w-full relative flex flex-col">

                {/* 1. BRANDING SECTION */}
                <div className="relative w-full flex justify-between items-baseline mb-1">
                    <h1 className="font-gothic text-6xl md:text-8xl tracking-tighter lowercase leading-[0.8] drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                        hyper$lump
                    </h1>
                    {/* Decorative status on the far right edge */}
                    <div className="hidden md:flex flex-col items-end font-mono text-[8px] opacity-30 tracking-[0.5em] uppercase">
                        <span>Terminal_Ready</span>
                        <span>Link_Established</span>
                    </div>
                </div>

                {/* 2. SECONDARY DATA AREA (DISTRIBUTED TO EDGES) */}
                <div className="relative w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6 py-1 transition-all duration-300">
                    {/* Left Data Column - No left margin to align with H1 and Grid Start */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-12 flex-1">
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="space-y-1">
                                <div className="h-6 w-full md:w-48 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/20 opacity-30" />
                                    <div className="absolute top-1 left-2 font-mono text-[5px] opacity-40">SIGNAL_STREAM_01</div>
                                </div>
                                <div className="h-6 w-full md:w-48 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                    <div className="absolute top-1 left-2 font-mono text-[5px] opacity-40">CARRIER_REF_99</div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Data Strip */}
                        <div className="hidden lg:flex flex-col gap-1 font-mono text-[8px] uppercase tracking-[0.2em] opacity-30 min-w-[200px]">
                            <div className="flex justify-between border-b border-primary/10 pb-0.5">
                                <span>Sys: V.4.0</span>
                                <span>[ OK ]</span>
                            </div>
                            <div className="flex justify-between border-b border-primary/10 pb-0.5">
                                <span>Cortex: Link</span>
                                <span className="text-primary opacity-60">ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. CATALOG MODULE (PUSHED TO FAR RIGHT EDGE) */}
                    <div className="bg-primary/5 px-6 py-2 border-2 border-primary/40 backdrop-blur-sm min-w-[180px] md:min-w-[240px]">
                        <div className="text-[8px] uppercase font-bold tracking-[0.3em] text-primary mb-0.5 text-right opacity-70">
                            Current Catalog_
                        </div>
                        <div className="text-4xl md:text-6xl font-gothic leading-none text-right">
                            {productCount} Items
                        </div>
                    </div>
                </div>

                {/* Decorative Tech Legend (Distributed to edges) */}
                <div className="mt-4 flex items-center justify-between font-mono text-[7px] opacity-20 uppercase tracking-[0.3em] w-full border-t border-primary/10 pt-2">
                    <div className="flex items-center gap-4">
                        <span>Antifreeze_Synthesis_Hub</span>
                        <div className="h-[1px] w-12 bg-primary/30" />
                        <span>Build: 01A-X</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>©2026 HYPER$LUMP_IND</span>
                        <div className="h-[1px] w-12 bg-primary/30" />
                        <span>SECURE_DATA_READY</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
