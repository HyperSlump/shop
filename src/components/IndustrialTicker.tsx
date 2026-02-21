'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function IndustrialTicker() {
    const containerRef = useRef<HTMLDivElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);
    const row1AnimRef = useRef<gsap.core.Tween | null>(null);
    const row2AnimRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (!row1Ref.current || !row2Ref.current) return;

        row1AnimRef.current = gsap.to(row1Ref.current, {
            xPercent: -50,
            duration: 240,
            ease: 'none',
            repeat: -1,
            paused: false
        });

        gsap.set(row2Ref.current, { xPercent: -50 });
        row2AnimRef.current = gsap.to(row2Ref.current, {
            xPercent: 0,
            duration: 200,
            ease: 'none',
            repeat: -1,
            paused: false
        });

        return () => {
            if (row1AnimRef.current) row1AnimRef.current.kill();
            if (row2AnimRef.current) row2AnimRef.current.kill();
        };
    }, []);

    const row1Text = 'new drops // hyper$lump // instant access // read blog // mode:live // ';
    const row2Text = 'cold theme // hot theme // cart ready // checkout live // 60_bpm sync // ';

    return (
        <div ref={containerRef} className="w-full py-0 px-0 select-none relative z-20 pointer-events-auto overflow-hidden">
            <div className="border-y border-border bg-background relative">
                <div className="w-full">
                    <div className="overflow-hidden w-full">
                        <div ref={row1Ref} className="flex whitespace-nowrap py-2 border-b border-primary/5 w-fit">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex">
                                    {[...Array(6)].map((_, j) => (
                                        <span key={j} className="jacquard-24-regular lowercase text-5xl md:text-7xl text-primary px-12 tracking-[0.03em] leading-none">
                                            {row1Text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden w-full">
                        <div ref={row2Ref} className="flex whitespace-nowrap py-1 w-fit">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex">
                                    {[...Array(8)].map((_, j) => (
                                        <span key={j} className="jacquard-24-regular uppercase text-xl md:text-2xl text-foreground/55 px-16 tracking-[0.04em] leading-none">
                                            {row2Text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-4 md:right-12 px-2 bg-background border-x border-primary/20 -translate-y-1/2">
                    <span className="font-mono text-[10px] text-primary/40 uppercase tracking-tighter">Tape_Feed.v1</span>
                </div>
                <div className="absolute top-0 left-0 w-8 md:w-48 h-[1px] bg-primary/40 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-8 md:w-48 h-[1px] bg-primary/40 translate-y-1/2" />
            </div>
        </div>
    );
}
