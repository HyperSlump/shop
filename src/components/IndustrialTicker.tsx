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
        // Register ScrollTrigger only on the client
        if (typeof window !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (!row1Ref.current || !row2Ref.current) return;

        // Ensure row contents are cloned for seamless looping
        // Row 1: Right to Left
        row1AnimRef.current = gsap.to(row1Ref.current, {
            xPercent: -50,
            duration: 40,
            ease: "none",
            repeat: -1,
            paused: false
        });

        // Row 2: Left to Right
        // We set initial xPercent to -50 and animate back to 0
        gsap.set(row2Ref.current, { xPercent: -50 });
        row2AnimRef.current = gsap.to(row2Ref.current, {
            xPercent: 0,
            duration: 20,
            ease: "none",
            repeat: -1,
            paused: false
        });

        // Add Velocity Responsive Behavior
        const trigger = ScrollTrigger.create({
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const skew = velocity / 300;
                const speed = 1 + Math.abs(velocity / 600);

                // Apply Skew
                gsap.to([row1Ref.current, row2Ref.current], {
                    skewX: skew,
                    duration: 0.1,
                    overwrite: true
                });

                // Apply Speed Multiplier
                if (row1AnimRef.current && row2AnimRef.current) {
                    gsap.to([row1AnimRef.current, row2AnimRef.current], {
                        timeScale: speed,
                        duration: 0.2,
                        overwrite: true
                    });
                }
            }
        });

        return () => {
            if (row1AnimRef.current) row1AnimRef.current.kill();
            if (row2AnimRef.current) row2AnimRef.current.kill();
            trigger.kill();
        };
    }, []);

    const onMouseEnter = (rowRef: React.RefObject<HTMLDivElement | null>) => {
        const row = rowRef.current;
        if (!row) return;

        // Find the animation associated with this row
        const anim = rowRef === row1Ref ? row1AnimRef.current : row2AnimRef.current;
        if (anim) anim.pause();

        // Glitch flicker
        gsap.to(row, {
            opacity: 0.2,
            repeat: 7,
            yoyo: true,
            duration: 0.04,
            onComplete: () => { gsap.set(row, { opacity: 1 }); }
        });
    };

    const onMouseLeave = (rowRef: React.RefObject<HTMLDivElement | null>) => {
        const anim = rowRef === row1Ref ? row1AnimRef.current : row2AnimRef.current;
        if (anim) anim.play();
    };

    const row1Text = "NEW MERCH OUT NOW — HYPER$LUMP — INDUSTRIAL_CORE_V1 — READ BLOG — SYSTEM_ACTIVE — ";
    const row2Text = "$ $ $ $ /// REF_ID: 0x8823 /// ANALOG_ACTIVE /// $$$ /// 120.00_BPM /// SIGNAL_LOST /// ";

    return (
        <div ref={containerRef} className="w-full py-16 px-6 md:px-12 select-none relative z-20 pointer-events-auto">
            <div className="border-y border-foreground/10 bg-[var(--background)] relative">
                <div className="w-full overflow-hidden border-x border-primary/5">
                    {/* Row 1 / Gothic */}
                    <div
                        className="overflow-hidden w-full cursor-pointer"
                        onMouseEnter={() => onMouseEnter(row1Ref)}
                        onMouseLeave={() => onMouseLeave(row1Ref)}
                    >
                        <div ref={row1Ref} className="flex whitespace-nowrap py-2 border-b border-primary/5 w-fit">
                            {/* Double the content for a seamless GSAP loop */}
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex">
                                    {[...Array(6)].map((_, j) => (
                                        <span key={j} className="font-gothic text-5xl md:text-7xl text-primary px-12 tracking-wider">
                                            {row1Text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 2 / Mono */}
                    <div
                        className="overflow-hidden w-full cursor-pointer"
                        onMouseEnter={() => onMouseEnter(row2Ref)}
                        onMouseLeave={() => onMouseLeave(row2Ref)}
                    >
                        <div ref={row2Ref} className="flex whitespace-nowrap py-1 w-fit">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex">
                                    {[...Array(8)].map((_, j) => (
                                        <span key={j} className="font-mono text-xs md:text-sm text-foreground/50 px-16 tracking-[0.4em] uppercase">
                                            {row2Text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Technical Detail Overlays */}
                <div className="absolute top-0 right-4 md:right-8 px-2 bg-[var(--background)] border-x border-primary/20 -translate-y-1/2">
                    <span className="font-mono text-[8px] text-primary/40 uppercase tracking-tighter">Tape_Feed.v1</span>
                </div>
                <div className="absolute top-0 left-0 w-8 md:w-16 h-[1px] bg-primary/30 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-8 md:w-16 h-[1px] bg-primary/30 translate-y-1/2" />
            </div>
        </div>
    );
}
