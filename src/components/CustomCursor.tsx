'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trail = trailRef.current;
        if (!cursor || !trail) return;

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

            // Trail Cursor - Glitchy follow
            gsap.to(trail, {
                x: clientX,
                y: clientY,
                duration: 0.6,
                ease: "expo.out",
                onUpdate: () => {
                    // Random glitch offsets
                    if (Math.random() > 0.95) {
                        gsap.set(trail, {
                            x: clientX + (Math.random() * 10 - 5),
                            y: clientY + (Math.random() * 10 - 5),
                            opacity: Math.random()
                        });
                    } else {
                        gsap.set(trail, { opacity: 0.4 });
                    }
                }
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
                className="fixed top-0 left-0 w-4 h-4 -ml-2 -mt-2 z-[9999] pointer-events-none"
                style={{ opacity: isVisible ? 1 : 0 }}
            >
                <div className={`w-full h-full border-2 transition-all duration-300 transform ${isHovering ? 'scale-[2.5] bg-primary border-primary rounded-full' : 'scale-100 rotate-45 border-black'}`} />

                {/* Technical Crosshairs */}
                <div className={`absolute top-1/2 left-[-4px] right-[-4px] h-[1px] bg-black/40 transition-opacity ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
                <div className={`absolute left-1/2 top-[-4px] bottom-[-4px] w-[1px] bg-black/40 transition-opacity ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
            </div>

            {/* Glitchy Trail */}
            <div
                ref={trailRef}
                className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 z-[9998] pointer-events-none border border-primary opacity-40"
                style={{ opacity: (isVisible && !isHovering) ? 0.4 : 0 }}
            >
                {/* Ghosting Layers */}
                <div className="absolute inset-0 border border-primary/30 translate-x-[2px] translate-y-[-2px] animate-pulse" />
                <div className="absolute inset-0 border border-primary/30 translate-x-[-2px] translate-y-[2px] animate-pulse delay-75" />
            </div>

        </>
    );
}
