'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const trailSegments = [0, 1, 2, 3]; // 4 trail segments

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Mouse move tracking
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            if (!isVisible) setIsVisible(true);

            // Main Cursor - Fixed follow
            gsap.to(cursor, {
                x: clientX,
                y: clientY,
                duration: 0.1,
                ease: "power2.out"
            });

            // Trail Segments - Each follows with more lag
            trailRefs.current.forEach((trail, index) => {
                if (!trail) return;
                const lag = 0.2 + index * 0.15;

                gsap.to(trail, {
                    x: clientX,
                    y: clientY,
                    duration: lag,
                    ease: "power2.out",
                    onUpdate: () => {
                        // High intensity glitch on trails
                        if (Math.random() > 0.9) {
                            gsap.set(trail, {
                                x: clientX + (Math.random() * 20 - 10),
                                y: clientY + (Math.random() * 20 - 10),
                                opacity: Math.random() * 0.6
                            });
                        } else {
                            gsap.set(trail, { opacity: 0.3 / (index + 1) });
                        }
                    }
                });
            });
        };

        // Hover effect detection
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, input, [role="button"], .cursor-pointer');
            if (isClickable) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Global CSS to hide default cursor */}
            <style jsx global>{`
                @media (pointer: fine) {
                    * {
                        cursor: none !important;
                    }
                }
            `}</style>

            {/* Main Interactive Cursor */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-5 h-5 -ml-1 -mt-1 z-[9999] pointer-events-none"
                style={{ opacity: isVisible ? 1 : 0 }}
            >
                {/* Classic Pointer Shape: Black with White Border */}
                <div
                    className={`transition-all duration-300 transform ${isHovering
                            ? 'w-6 h-6 bg-primary rounded-full scale-125'
                            : 'w-0 h-0 border-l-[10px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent transform rotate-[25deg]'
                        }`}
                    style={{
                        filter: isHovering ? 'none' : 'drop-shadow(1px 1px 0px white) drop-shadow(-1px -1px 0px white) drop-shadow(1px -1px 0px white) drop-shadow(-1px 1px 0px white)'
                    }}
                />
            </div>

            {/* Glitchy Multi-Trail */}
            {trailSegments.map((_, i) => (
                <div
                    key={i}
                    ref={el => { trailRefs.current[i] = el; }}
                    className="fixed top-0 left-0 w-6 h-6 -ml-3 -mt-3 z-[9998] pointer-events-none border border-primary/40"
                    style={{ opacity: (isVisible && !isHovering) ? 1 : 0 }}
                >
                    <div className="absolute inset-0 border border-primary/20 translate-x-[1px] translate-y-[-1px] animate-pulse" />
                </div>
            ))}
        </>
    );
}
