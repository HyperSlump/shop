'use client';

import MatrixSpace from './MatrixSpace';
import EncryptText from './EncryptText';

interface HeroSchemaProps {
    productCount: number;
}

export default function HeroSchema({ productCount }: HeroSchemaProps) {
    return (
        <section className="relative w-full overflow-hidden bg-[var(--background)] px-4 pt-4 pb-2 md:px-12 md:pt-6 md:pb-3 border-b-2 border-primary/20 animate-fade-in">
            {/* MAIN CONTAINER FOR WRAPPED CONTENT */}
            <div className="max-w-[1400px] mx-auto relative flex flex-col">

                {/* 1. WRAPPED SECTION (Title + Encryption) */}
                <div className="relative group self-start">
                    {/* Background Matrix Element - Pre-built */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                        <MatrixSpace isVisible={true} />
                    </div>

                    <div className="relative z-10 p-4 border-2 border-primary/30 bg-black/5 dark:bg-white/5 backdrop-blur-sm max-w-2xl">
                        {/* Status Bits from ProductCard pattern */}
                        <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-2 border-l-2 border-primary z-20" />
                        <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-2 border-r-2 border-primary z-20" />

                        <h1 className="font-gothic text-6xl md:text-8xl tracking-tighter lowercase leading-[0.8] mb-2 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                            hyper$lump
                        </h1>
                        <div className="relative">
                            <EncryptText />
                        </div>

                        {/* Corner Decorative Dots */}
                        <div className="absolute top-2 right-2 flex gap-1">
                            <div className="w-1 h-1 bg-primary pulse-slow" />
                            <div className="w-1 h-1 bg-primary/40" />
                        </div>
                    </div>

                    {/* Stepped schematic line connecting to footer section */}
                    <div className="absolute left-0 bottom-[-10px] w-[2px] h-10 bg-primary/40" />
                    <div className="absolute left-0 bottom-[-10px] w-20 h-[2px] bg-primary/40" />
                </div>

                {/* 2. SECONDARY DATA AREA (Schematic Frame) */}
                <div className="relative mt-0 ml-10 md:ml-20 flex flex-col md:flex-row items-start md:items-end gap-12 border-l-2 border-primary/20 pl-8 md:pl-16 py-1">
                    {/* Horizontal separator line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/10" />

                    {/* Left Data Column */}
                    <div className="flex flex-col gap-6 w-full md:w-auto">
                        <div className="flex flex-col gap-2">
                            <div className="h-1 w-32 bg-primary/20" />
                            <div className="h-1 w-24 bg-primary/40" />
                            <div className="h-1 w-40 bg-primary/10" />
                        </div>

                        <div className="space-y-4">
                            <div className="h-12 w-full md:w-64 border border-primary/20 bg-primary/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                                <div className="absolute top-2 left-2 font-mono text-[7px] opacity-40">SIGNAL_STREAM_01</div>
                            </div>
                            <div className="h-12 w-full md:w-64 border border-primary/20 bg-primary/5 relative overflow-hidden">
                                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/40 opacity-50" />
                                <div className="absolute top-2 left-2 font-mono text-[7px] opacity-40">CARRIER_SIGNAL_04</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Data Strip */}
                    <div className="flex-1 flex flex-col gap-4 font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">
                        <div className="flex justify-between border-b border-primary/20 pb-2">
                            <span>Sys_Core: V.4.0.2</span>
                            <span>[ OPTIMIZED ]</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/20 pb-2">
                            <span>Audio_Buffer: ACTIVE</span>
                            <span className="animate-pulse">STREAMING</span>
                        </div>
                        <div className="flex justify-between border-b border-primary/20 pb-2">
                            <span>Network_Status: ENCRYPTED</span>
                            <span>AES_256</span>
                        </div>
                    </div>

                    {/* 3. CATALOG MODULE (Integrated into frame) */}
                    <div className="self-end md:self-auto bg-[var(--background)] px-8 py-4 border-2 border-primary shadow-[4px_4px_0px_rgba(var(--primary-rgb),0.2)]">
                        <div className="text-[10px] uppercase font-bold tracking-[0.4em] text-primary mb-2 text-right opacity-60">
                            Current Catalog_
                        </div>
                        <div className="text-5xl md:text-7xl font-gothic leading-none text-right">
                            {productCount} Items
                        </div>
                    </div>
                </div>

                {/* Decorative Tech Legend */}
                <div className="mt-1 flex items-center justify-between font-mono text-[8px] opacity-20 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-4">
                        <span>Antifreeze_Synthesis_Hub</span>
                        <div className="h-[1px] w-12 bg-primary" />
                        <span>Build_Ref: 01A-X</span>
                    </div>
                    <span>©2026 HYPERSLUMP_IND</span>
                </div>
            </div>

            <style jsx>{`
                .pulse-slow {
                    animation: pulse-slow 3s infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </section>
    );
}
