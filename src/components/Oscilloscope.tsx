'use client';

import React, { useEffect, useRef } from 'react';

const Oscilloscope: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const resize = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            // Get primary color from CSS variable
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4F46E5';

            ctx.beginPath();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = primaryColor;

            offset += 0.05;

            for (let x = 0; x <= width; x++) {
                // Waveform logic:
                // We want mostly a flat line with sporadic "bursts" of activity.

                // Use multiple sines for complex movement
                const slowWave = Math.sin(x * 0.005 + offset * 0.5);
                const fastWave = Math.sin(x * 0.05 + offset * 2);
                const noise = Math.sin(x * 0.2 + offset * 5) * 0.5;

                // Modulation: only show peaks in certain areas
                // We'll use a larger sine to modulate the amplitude
                const modulation = Math.pow(Math.sin(x * 0.01 + offset * 0.2), 4);

                // Occasional spikes logic
                const spike = Math.sin(x * 0.1 - offset) > 0.9 ? Math.sin(x * 0.5 + offset * 10) * 40 : 0;

                const y = centerY + (fastWave + noise) * 15 * modulation + spike;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Add some "scanline" artifacts or dots at the start/end
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.arc(0, centerY, 3, 0, Math.PI * 2);
            ctx.arc(width, centerY, 3, 0, Math.PI * 2);
            ctx.fill();

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full opacity-60 mix-blend-screen"
        />
    );
};

export default Oscilloscope;
