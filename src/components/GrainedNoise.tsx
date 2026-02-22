'use client';

import React, { useEffect, useState } from 'react';

// Replicating grained.js natively in React to avoid SSR / window mutation issues
export default function GrainedNoise({ animate = true }: { animate?: boolean }) {
    const [noiseUrl, setNoiseUrl] = useState('');

    useEffect(() => {
        const options = {
            patternWidth: 100,
            patternHeight: 100,
            grainOpacity: 0.15,
            grainDensity: 1.5,
            grainWidth: 1,
            grainHeight: 1
        };

        const generateNoise = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return '';

            canvas.width = options.patternWidth;
            canvas.height = options.patternHeight;

            for (let w = 0; w < options.patternWidth; w += options.grainDensity) {
                for (let h = 0; h < options.patternHeight; h += options.grainDensity) {
                    const rgb = Math.floor(Math.random() * 256);
                    ctx.fillStyle = `rgba(${rgb},${rgb},${rgb},${options.grainOpacity})`;
                    ctx.fillRect(w, h, options.grainWidth, options.grainHeight);
                }
            }
            return canvas.toDataURL('image/png');
        };

        setNoiseUrl(generateNoise());
    }, []);

    if (!noiseUrl) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
            <div
                className="absolute -inset-[100%] w-[300%] h-[300%] opacity-40 mix-blend-screen"
                style={{
                    backgroundImage: `url(${noiseUrl})`,
                    ...(animate && { animation: 'grained 0.5s steps(20, end) infinite' })
                }}
            />
            {animate && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes grained {
                        0% { transform: translate(-10%, 10%); }
                        10% { transform: translate(-25%, 0%); }
                        20% { transform: translate(-30%, 10%); }
                        30% { transform: translate(-30%, 30%); }
                        40% { transform: translate(-20%, 20%); }
                        50% { transform: translate(-15%, 10%); }
                        60% { transform: translate(-20%, 20%); }
                        70% { transform: translate(-5%, 20%); }
                        80% { transform: translate(-25%, 5%); }
                        90% { transform: translate(-30%, 25%); }
                        100% { transform: translate(-10%, 10%); }
                    }
                `}} />
            )}
        </div>
    );
}
