'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface OneShotPlayerProps {
    audioUrl: string;
    label?: string;
    isActive: boolean;
    loop?: boolean;
}

export default function OneShotPlayer({ audioUrl, isActive, loop = false }: OneShotPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let ws: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

        const init = async () => {
            if (!containerRef.current) return;
            containerRef.current.innerHTML = '';

            const WaveSurfer = (await import('wavesurfer.js')).default;

            const isDark = document.documentElement.classList.contains('dark');
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ccff00';

            ws = WaveSurfer.create({
                container: containerRef.current,
                height: 'auto',
                waveColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
                progressColor: primary,
                cursorColor: loop ? primary : 'transparent',
                cursorWidth: loop ? 1 : 0,
                normalize: true,
                interact: loop,
            });

            ws.load(audioUrl);

            ws.on('ready', () => { wavesurferRef.current = ws; });
            ws.on('play', () => setIsPlaying(true));
            ws.on('pause', () => setIsPlaying(false));
            ws.on('finish', () => {
                if (loop) {
                    ws.play();
                } else {
                    setIsPlaying(false);
                    ws.seekTo(0);
                }
            });
            if (loop) {
                ws.on('interaction', () => ws.play());
            }
        };

        if (audioUrl) init();

        return () => { if (ws) ws.destroy(); };
    }, [audioUrl, isActive, loop]);

    useEffect(() => {
        if (!isActive && wavesurferRef.current) {
            wavesurferRef.current.pause();
            wavesurferRef.current.seekTo(0);
            setIsPlaying(false);
        }
    }, [isActive]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (wavesurferRef.current) {
            if (loop) {
                wavesurferRef.current.playPause();
            } else {
                wavesurferRef.current.seekTo(0);
                wavesurferRef.current.play();
            }
        }
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden cursor-pointer"
            onClick={handleClick}
        >
            {/* Play/Pause */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10 pointer-events-none w-8 h-11 flex items-center justify-center">
                {isPlaying ? (
                    <Pause size={14} className="text-primary fill-current" />
                ) : (
                    <Play size={14} className="text-foreground/60 fill-current" />
                )}
            </div>

            {/* Waveform */}
            <div ref={containerRef} className="absolute top-0 bottom-0 left-9 right-0" />
        </div>
    );
}
