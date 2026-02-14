'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const PARAGRAPHS = [
    "Industrial sound design textures, raw synthesis, and broken percussion for the electronic avant-garde. Optimized for professional digital production.",
    "Cortex synthesis hub. Advanced signal processing for modern electronic composition. High-fidelity sonic artifacts for the digital underground.",
    "Deep-cycle oscillators, granular textures, and rhythmic interference patterns. Engineered for visceral impact across all playback systems.",
    "Digital brutalism in sonic form. Raw electricity and broken signals curated for the experimental producer. Performance grade assets."
];

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789';

export default function EncryptText() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState(PARAGRAPHS[0]);
    const [isScrambling, setIsScrambling] = useState(false);

    // Use a ref to track the current text without triggering re-renders in the loop
    const textRef = useRef(PARAGRAPHS[0]);

    const scramble = useCallback(async (targetText: string) => {
        if (isScrambling) return;
        setIsScrambling(true);

        const currentText = textRef.current;
        const maxLength = Math.max(currentText.length, targetText.length);

        // 1. PHASE ONE: Scramble current text into chaotic symbols (Slowed down)
        for (let step = 0; step < 15; step++) {
            let scrambled = '';
            for (let i = 0; i < maxLength; i++) {
                if (Math.random() > 0.4) {
                    scrambled += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                } else {
                    scrambled += currentText[i] || targetText[i] || ' ';
                }
            }
            setDisplayText(scrambled);
            await new Promise(r => setTimeout(r, 70)); // Slower scramble
        }

        // 2. PHASE TWO: Gradually resolve to target text (Smoother resolution)
        let resolvedIndices = new Set<number>();
        const totalChars = targetText.length;

        // Increase resolution granularity
        while (resolvedIndices.size < totalChars) {
            let nextText = '';
            for (let i = 0; i < totalChars; i++) {
                if (resolvedIndices.has(i)) {
                    nextText += targetText[i];
                } else {
                    // Slower resolution rate (0.05 vs 0.1)
                    if (Math.random() < 0.05) {
                        resolvedIndices.add(i);
                        nextText += targetText[i];
                    } else {
                        nextText += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    }
                }
            }
            setDisplayText(nextText);
            await new Promise(r => setTimeout(r, 60)); // Slower resolution steps
        }

        setDisplayText(targetText);
        textRef.current = targetText;
        setIsScrambling(false);
    }, [isScrambling]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isScrambling) {
                const nextIndex = (currentIndex + 1) % PARAGRAPHS.length;
                setCurrentIndex(nextIndex);
                scramble(PARAGRAPHS[nextIndex]);
            }
        }, 10000); // Wait 10 seconds between morphs (Slower)

        return () => clearTimeout(timeoutId);
    }, [currentIndex, isScrambling, scramble]);

    return (
        <div className="relative max-w-xl group">
            {/* 
                GHOST STACK: 
                We render all paragraphs invisibly to force the container to take the height 
                 of the largest possible paragraph, preventing layout shift. 
            */}
            <div className="invisible aria-hidden pointer-events-none relative" aria-hidden="true">
                {PARAGRAPHS.map((p, i) => (
                    <div
                        key={i}
                        className={`text-sm md:text-base font-mono leading-relaxed ${i === 0 ? 'relative' : 'absolute inset-0'}`}
                    >
                        {p}
                    </div>
                ))}
            </div>

            {/* VISIBLE OVERLAY */}
            <div className="absolute inset-0">
                <p className="text-sm md:text-base text-foreground/80 font-mono leading-relaxed transition-all duration-500">
                    <span className={isScrambling ? "text-primary brightness-150 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : ""}>
                        {displayText}
                    </span>
                    {isScrambling && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse" />}
                </p>
            </div>
        </div>
    );
}
