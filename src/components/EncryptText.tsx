'use client';

import { useState, useEffect, useCallback } from 'react';

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

    const scramble = useCallback(async (targetText: string) => {
        setIsScrambling(true);
        const currentText = displayText;
        const maxLength = Math.max(currentText.length, targetText.length);
        const iterations = 15; // Number of scramble steps per character

        // 1. Scramble current text into symbols
        for (let step = 0; step < 10; step++) {
            let scrambled = '';
            for (let i = 0; i < maxLength; i++) {
                if (Math.random() > 0.3) {
                    scrambled += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                } else {
                    scrambled += currentText[i] || targetText[i] || ' ';
                }
            }
            setDisplayText(scrambled);
            await new Promise(r => setTimeout(r, 50));
        }

        // 2. Gradually resolve to target text
        let resolvedIndices = new Set<number>();
        const totalChars = targetText.length;

        while (resolvedIndices.size < totalChars) {
            let nextText = '';
            for (let i = 0; i < totalChars; i++) {
                if (resolvedIndices.has(i)) {
                    nextText += targetText[i];
                } else {
                    if (Math.random() < 0.1) {
                        resolvedIndices.add(i);
                        nextText += targetText[i];
                    } else {
                        nextText += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    }
                }
            }
            // Account for length difference if target is shorter than current
            setDisplayText(nextText);
            await new Promise(r => setTimeout(r, 40));
        }

        setDisplayText(targetText);
        setIsScrambling(false);
    }, [displayText]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const triggerNext = () => {
            timeoutId = setTimeout(() => {
                const nextIndex = (currentIndex + 1) % PARAGRAPHS.length;
                setCurrentIndex(nextIndex);
                scramble(PARAGRAPHS[nextIndex]);
            }, 6000); // 6 seconds of static display
        };

        if (!isScrambling) {
            triggerNext();
        }

        return () => clearTimeout(timeoutId);
    }, [currentIndex, isScrambling, scramble]);

    return (
        <p className="text-sm md:text-base max-w-xl text-foreground font-mono leading-relaxed min-h-[5em] md:min-h-[4em] transition-opacity duration-300">
            {displayText}
        </p>
    );
}
