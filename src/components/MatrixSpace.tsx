'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MatrixSpace({ isVisible = true }: { isVisible?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isVisible) return;

        // Delay to ensure container has dimensions after transitions
        const timer = setTimeout(() => {
            const { width, height } = container.getBoundingClientRect();
            if (width === 0 || height === 0) return;

            const columns = Math.floor(width / 12); // Match the 12px spacing used below

            // Clear previous content
            container.innerHTML = '';

            const fontSize = 10;
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&%';

            // Create streams
            const streams: HTMLDivElement[] = [];

            for (let i = 0; i < columns; i++) {
                const stream = document.createElement('div');
                stream.className = 'absolute top-0 font-mono leading-none text-primary/70 select-none pointer-events-none flex flex-col items-center gap-0';
                stream.style.left = `${i * 12}px`;
                stream.style.fontSize = `${fontSize}px`;

                // Random stream content
                const length = Math.floor(Math.random() * 15) + 10;
                let content = '';

                for (let j = 0; j < length; j++) {
                    const char = chars[Math.floor(Math.random() * chars.length)];
                    content += `<span style="opacity: ${Math.random() * 0.7 + 0.3}">${char}</span>`;
                }
                stream.innerHTML = content;
                container.appendChild(stream);
                streams.push(stream);

                const duration = Math.random() * 4 + 2;
                const delay = Math.random() * 5;
                const streamHeight = length * fontSize;

                gsap.fromTo(stream,
                    { y: -streamHeight - 50 },
                    {
                        y: height + 50,
                        duration: duration,
                        repeat: -1,
                        ease: 'none',
                        delay: delay
                    }
                );

                gsap.to(stream, {
                    opacity: 0.3 + Math.random() * 0.5,
                    duration: 0.1,
                    repeat: -1,
                    yoyo: true,
                    repeatDelay: Math.random() * 2,
                    ease: "steps(1)"
                });
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (container) {
                gsap.killTweensOf(container.querySelectorAll('div'));
                container.innerHTML = '';
            }
        };
    }, [isVisible]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
