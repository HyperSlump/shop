'use client';

import React from 'react';

interface MockPageLayoutProps {
    title: string;
    subtitle: string;
    content: string;
    status: string;
}

export default function MockPageLayout({ title, subtitle, content, status }: MockPageLayoutProps) {
    return (
        <div className="flex-1 w-full p-4 md:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header System Line */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-8 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary/60 font-mono text-[10px] tracking-[0.3em]">
                            <span className="w-2 h-2 bg-primary animate-pulse" />
                            SYS_LOC // {title.toUpperCase()}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-gothic tracking-tighter leading-none">
                            {subtitle}
                        </h1>
                    </div>
                    <div className="flex flex-col items-start md:items-end font-mono text-[10px] opacity-40">
                        <p>ACCESS_CODE: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        <p>STATUS_ID: {status}</p>
                    </div>
                </div>

                {/* Content Area with Glitch/Indie Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-lg leading-relaxed opacity-80 max-w-prose">
                            {content}
                        </p>

                        {/* Decorative Technical Legend */}
                        <div className="p-4 border border-foreground/10 bg-foreground/[0.02] space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono opacity-50">
                                <span>SIGNAL_STRENGTH</span>
                                <span>[|||||||||||||---] 85%</span>
                            </div>
                            <div className="w-full h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
                            <div className="text-[10px] font-mono opacity-30 italic">
                                &gt; Warning: Module data is currently in a fragmented state.
                                Full retrieval scheduled for next cycle.
                            </div>
                        </div>
                    </div>

                    {/* Decorative Visual Element */}
                    <div className="relative aspect-square md:aspect-auto border border-primary/10 overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-icons text-[120px] opacity-10 group-hover:scale-110 transition-transform duration-700">settings_input_component</span>
                        </div>
                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-scan" style={{ top: '0%' }} />
                    </div>
                </div>

                {/* Footer Section Indicators */}
                <div className="flex flex-wrap gap-4 pt-12">
                    {['X_PROTO', 'Y_ALGO', 'Z_CORE'].map((tag) => (
                        <div key={tag} className="px-3 py-1 border border-foreground/10 text-[9px] font-mono opacity-40 hover:opacity-100 hover:border-primary/40 transition-all cursor-default uppercase">
                            {tag}
                        </div>
                    ))}
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
        </div>
    );
}
