'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformOverlayProps {
    audioUrl: string;
    isActive: boolean;
}

export default function WaveformOverlay({ audioUrl, isActive }: WaveformOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const isMounted = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        isMounted.current = true;
        let ws: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

        const init = async () => {
            if (!containerRef.current) return;
            containerRef.current.innerHTML = '';

            const WaveSurfer = (await import('wavesurfer.js')).default;
            if (!isMounted.current) return;

            const isDark = document.documentElement.classList.contains('dark');
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ccff00';

            ws = WaveSurfer.create({
                container: containerRef.current,
                height: 'auto',
                waveColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
                progressColor: primary,
                cursorColor: primary,
                cursorWidth: 1,
                normalize: true,
            });

            ws.load(audioUrl);

            ws.on('ready', () => {
                if (isMounted.current) {
                    wavesurferRef.current = ws;
                    setIsReady(true);
                }
            });
            ws.on('play', () => setIsPlaying(true));
            ws.on('pause', () => setIsPlaying(false));
            ws.on('finish', () => { if (isMounted.current) ws.play(); });
            ws.on('interaction', () => { if (isMounted.current) ws.play(); });
        };

        if (audioUrl) init();

        return () => {
            isMounted.current = false;
            if (ws) { ws.pause(); ws.destroy(); }
        };
    }, [audioUrl, isActive]);

    useEffect(() => {
        if (!isActive && wavesurferRef.current) {
            wavesurferRef.current.pause();
            wavesurferRef.current.seekTo(0);
            setIsPlaying(false);
        }
    }, [isActive]);

    return (
        <div
            className="relative w-full h-full overflow-hidden cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                if (wavesurferRef.current) wavesurferRef.current.playPause();
            }}
        >
            {/* Play/Pause — 44px tap target */}
            {isReady && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10 pointer-events-none w-8 h-11 flex items-center justify-center">
                    {isPlaying ? (
                        <Pause size={14} className="text-primary fill-current" />
                    ) : (
                        <Play size={14} className="text-foreground/60 fill-current" />
                    )}
                </div>
            )}

            {/* Waveform — fills remaining width */}
            <div ref={containerRef} className="absolute top-0 bottom-0 left-9 right-0" />
        </div>
    );
}
