'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface OneShotPlayerProps {
    audioUrl: string;
    label?: string;
}

export default function OneShotPlayer({ audioUrl, label, isActive }: OneShotPlayerProps & { isActive: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let ws: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

        const init = async () => {
            if (!containerRef.current) return;
            const WaveSurfer = (await import('wavesurfer.js')).default;

            ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: 'rgba(255, 255, 255, 0.2)',
                progressColor: '#c0ff00', // Primary color
                cursorColor: 'transparent',
                barWidth: 2,
                barGap: 1,
                height: 24,
                normalize: true,
                backend: 'WebAudio',
                url: audioUrl,
                interact: false,
            });

            ws.on('ready', () => {
                wavesurferRef.current = ws;
            });

            ws.on('play', () => setIsPlaying(true));
            ws.on('pause', () => setIsPlaying(false));
            ws.on('finish', () => {
                setIsPlaying(false);
                ws.seekTo(0);
            });
        };

        if (audioUrl) {
            init();
        }

        return () => {
            if (ws) {
                ws.destroy();
            }
        };
    }, [audioUrl]);

    useEffect(() => {
        if (!isActive && wavesurferRef.current) {
            wavesurferRef.current.pause();
            wavesurferRef.current.seekTo(0);
            setIsPlaying(false);
        }
    }, [isActive]);

    const handleTrigger = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (wavesurferRef.current) {
            wavesurferRef.current.seekTo(0);
            wavesurferRef.current.play();
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest truncate">
                    {label}
                </span>
            )}
            <div
                className="relative bg-black/50 border border-white/10 rounded overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer h-[26px]"
                onClick={handleTrigger}
            >
                {/* Play Icon - Absolute Left */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    {isPlaying ? (
                        <Pause size={10} className="text-primary fill-current" />
                    ) : (
                        <Play size={10} className="text-white group-hover:text-primary fill-current transition-colors" />
                    )}
                </div>

                {/* Waveform - Padded left to avoid icon */}
                <div className="absolute inset-0 left-5 top-[1px]">
                    <div ref={containerRef} className="w-full" />
                </div>
            </div>
        </div>
    );
}
