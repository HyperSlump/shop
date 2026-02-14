'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MatrixSpace() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Ensure container has dimensions
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        const columns = Math.floor(width / 12); // ~12px spacing

        // Clear previous content
        container.innerHTML = '';

        const fontSize = 10;
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&%';

        // Create streams
        const streams: HTMLDivElement[] = [];

        for (let i = 0; i < columns; i++) {
            const stream = document.createElement('div');
            stream.className = 'absolute top-0 font-mono leading-none text-primary/20 select-none pointer-events-none flex flex-col items-center gap-0';
            stream.style.left = `${i * 12}px`;
            stream.style.fontSize = `${fontSize}px`;

            // Random stream content
            const length = gsap.utils.random(10, 25, 1);
            let content = '';

            for (let j = 0; j < length; j++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                // Random opacity for "digital decay" look
                content += `<span style="opacity: ${Math.random() * 0.6 + 0.1}">${char}</span>`;
            }
            stream.innerHTML = content;
            container.appendChild(stream);
            streams.push(stream);

            // Animate falling
            const duration = gsap.utils.random(2, 6);
            const delay = gsap.utils.random(0, 5);

            // Start above view (negative height of stream)
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

            // Glitch opacity flicker
            gsap.to(stream, {
                opacity: gsap.utils.random(0.3, 0.8),
                duration: 0.1,
                repeat: -1,
                yoyo: true,
                repeatDelay: gsap.utils.random(0, 2),
                ease: "steps(1)"
            });
        }

        return () => {
            gsap.killTweensOf(streams);
            if (container) container.innerHTML = '';
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
