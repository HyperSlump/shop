'use client';

import { useEffect, useRef, useState } from 'react';

interface WaveformOverlayProps {
    audioUrl: string;
    isActive: boolean;
    primaryColor?: string;
}

export default function WaveformOverlay({
    audioUrl,
    isActive,
    primaryColor = '#c0ff00' // Default Acid Green
}: WaveformOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        let ws: any = null;

        const init = async () => {
            if (!containerRef.current) return;
            const WaveSurfer = (await import('wavesurfer.js')).default;

            if (!isMounted.current) return;

            ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: primaryColor,
                progressColor: 'white',
                cursorColor: 'transparent',
                barWidth: 3,
                barGap: 3,
                height: 150, // Large height to cover image
                normalize: true,
                backend: 'WebAudio',
            });

            ws.load(audioUrl);

            ws.on('ready', () => {
                if (isMounted.current) {
                    wavesurferRef.current = ws;
                    // Adjust volume if needed, or mute by default until hover?
                    // For now, let's keep it simple.
                }
            });
        };

        if (audioUrl) {
            init();
        }

        return () => {
            isMounted.current = false;
            if (ws) ws.destroy();
        };
    }, [audioUrl, primaryColor]);

    // Handle Playback on Active State Change
    useEffect(() => {
        if (!wavesurferRef.current) return;

        if (isActive) {
            wavesurferRef.current.play();
        } else {
            wavesurferRef.current.pause();
            wavesurferRef.current.seekTo(0); // Reset to start
        }
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-screen opacity-90"
        />
    );
}
