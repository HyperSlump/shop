'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// Custom cursor component - Updated 2026-02-14
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
                {/* Custom Cursor Content */}
                <div className="transition-all duration-300 transform">
                    {isHovering ? (
                        /* Hand Pointer Icon */
                        <div className="relative w-8 h-8 -ml-4 -mt-4 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 5C13 4.44772 13.4477 4 14 4C14.5523 4 15 4.44772 15 5V11H16V9C16 8.44772 16.4477 8 17 8C17.5523 8 18 8.44772 18 9V11H19V10C19 9.44772 19.4477 9 20 9C20.5523 9 21 9.44772 21 10V16C21 18.7614 18.7614 21 16 21H13.5C11.0147 21 9 18.9853 9 16.5V13C9 12.4477 9.44772 12 10 12C10.5523 12 11 12.4477 11 13V11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11V5Z"
                                    fill="var(--primary)" />
                            </svg>
                        </div>
                    ) : (
                        /* Simple Arrow Pointer */
                        <div className="group">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L2 16L7 11L11 16L13 14L9 9L14 4L2 2Z"
                                    fill="var(--primary)" />
                            </svg>
                        </div>
                    )}
                </div>
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
