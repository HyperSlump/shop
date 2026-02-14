'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function IndustrialTicker() {
    const containerRef = useRef<HTMLDivElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!row1Ref.current || !row2Ref.current) return;

        const ctx = gsap.context(() => {
            // Row 1: Slow Left
            const r1 = gsap.to(row1Ref.current, {
                x: '-50%',
                duration: 40,
                ease: 'none',
                repeat: -1
            });

            // Row 2: Faster Right
            const r2 = gsap.to(row2Ref.current, {
                x: '0%',
                duration: 20,
                ease: 'none',
                repeat: -1
            });
            gsap.set(row2Ref.current, { x: '-50%' });

            // Velocity Skew & Speed boost
            ScrollTrigger.create({
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                    const skew = velocity / 200;
                    const speed = 1 + Math.abs(velocity / 500);

                    gsap.to([row1Ref.current, row2Ref.current], {
                        skewX: skew,
                        overwrite: true,
                        duration: 0.1
                    });

                    // Tempo scale
                    gsap.to([r1, r2], {
                        timeScale: speed,
                        overwrite: true,
                        duration: 0.2
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const row = e.currentTarget;
        const anim = gsap.getTweensOf(row)[0];
        if (anim) anim.pause();

        gsap.to(row, {
            opacity: 0.3,
            repeat: 5,
            yoyo: true,
            duration: 0.05,
            onComplete: () => { gsap.set(row, { opacity: 1 }); }
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const row = e.currentTarget;
        const anim = gsap.getTweensOf(row)[0];
        if (anim) anim.play();
    };

    const row1Content = "NEW MERCH OUT NOW — HYPER$LUMP — INDUSTRIAL_CORE_V1 — READ BLOG — SYSTEM_ACTIVE — ";
    const row2Content = "$ $ $ $ /// REF_ID: 0x8823 /// ANALOG_ACTIVE /// $$$ /// 120.00_BPM /// SIGNAL_LOST /// ";

    return (
        <div ref={containerRef} className="w-full max-w-full border-y border-foreground/10 bg-[var(--background)] overflow-hidden py-2 select-none relative z-20 box-border pointer-events-auto">
            {/* Row 1: Slow / Gothic */}
            <div
                ref={row1Ref}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex whitespace-nowrap py-2 border-b border-primary/5 cursor-pointer"
            >
                <div className="flex shrink-0 items-center">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <span key={i} className="font-gothic text-4xl md:text-5xl text-primary px-8 tracking-wider">
                            {row1Content}
                        </span>
                    ))}
                </div>
            </div>

            {/* Row 2: Fast / Mono */}
            <div
                ref={row2Ref}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex whitespace-nowrap py-1 cursor-pointer"
            >
                <div className="flex shrink-0 items-center">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i} className="font-mono text-[10px] md:text-xs text-foreground/40 px-12 tracking-[0.3em] uppercase">
                            {row2Content}
                        </span>
                    ))}
                </div>
            </div>

            {/* Industrial Overlay Brackets */}
            <div className="absolute top-0 left-4 w-4 h-[2px] bg-primary/40" />
            <div className="absolute bottom-0 right-4 w-4 h-[2px] bg-primary/40" />
        </div>
    );
}
