'use client';

import MatrixSpace from './MatrixSpace';

interface HeroSchemaProps {
    productCount: number;
}

export default function HeroSchema({ productCount }: HeroSchemaProps) {
    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] border-b-2 border-primary/20 animate-fade-in px-0 pt-0 pb-0">
            {/* MAIN CONTAINER - 100% WIDTH ZERO GAPS */}
            <div className="w-full relative flex flex-col p-4 md:p-6 lg:p-10">

                {/* 1. BRANDING SECTION */}
                <div className="relative w-full flex justify-between items-baseline mb-2">
                    <h1 className="font-gothic text-6xl md:text-9xl tracking-tighter lowercase leading-[0.8] drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                        hyper$lump
                    </h1>
                    {/* Decorative status on the far right edge */}
                    <div className="hidden md:flex flex-col items-end font-mono text-[9px] opacity-30 tracking-[0.5em] uppercase">
                        <span>Terminal_Ready</span>
                        <span>Link_Established</span>
                    </div>
                </div>

                {/* 2. SECONDARY DATA AREA */}
                <div className="relative w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6 py-2 transition-all duration-300">
                    {/* Left Data Column */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-12 flex-1">
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="space-y-1">
                                <div className="h-8 w-full md:w-56 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/20 opacity-30" />
                                    <div className="absolute top-1.5 left-3 font-mono text-[6px] opacity-40 uppercase tracking-widest">SIGNAL_STREAM_01</div>
                                </div>
                                <div className="h-8 w-full md:w-56 border border-primary/10 bg-primary/5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                    <div className="absolute top-1.5 left-3 font-mono text-[6px] opacity-40 uppercase tracking-widest">CARRIER_REF_99</div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Data Strip */}
                        <div className="hidden lg:flex flex-col gap-2 font-mono text-[9px] uppercase tracking-[0.3em] opacity-30 min-w-[250px]">
                            <div className="flex justify-between border-b border-primary/10 pb-1">
                                <span>Sys: V.4.0.ALPHA</span>
                                <span>[ OK ]</span>
                            </div>
                            <div className="flex justify-between border-b border-primary/10 pb-1">
                                <span>Cortex: Link</span>
                                <span className="text-primary opacity-60">ACTIVE_STREAM</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. CATALOG MODULE */}
                    <div className="bg-primary/5 px-4 py-2 border border-primary/30 backdrop-blur-sm min-w-[120px] md:min-w-[200px]">
                        <div className="text-[8px] uppercase font-bold tracking-[0.4em] text-primary mb-0.5 text-right opacity-60">
                            Catalog_Status
                        </div>
                        <div className="text-3xl md:text-5xl font-gothic leading-none text-right">
                            {productCount} Items
                        </div>
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
