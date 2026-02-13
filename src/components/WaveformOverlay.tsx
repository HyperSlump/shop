'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformOverlayProps {
    audioUrl: string;
    isActive: boolean;
    primaryColor?: string;
}

export default function WaveformOverlay({
    audioUrl,
    isActive,
    primaryColor = '#c0ff00'
}: WaveformOverlayProps) {
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
            const WaveSurfer = (await import('wavesurfer.js')).default;

            if (!isMounted.current) return;

            ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: primaryColor,
                progressColor: 'white',
                cursorColor: 'transparent',
                barWidth: 3,
                barGap: 3,
                height: 60, // Smaller height
                normalize: true,
                backend: 'WebAudio',
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
            ws.on('finish', () => {
                // Loop functionality
                if (isMounted.current) {
                    ws.play();
                }
            });

            // Interaction with waveform should toggle play or seek
            ws.on('interaction', () => {
                if (isMounted.current) {
                    ws.play();
                }
            });
        };

        if (audioUrl) {
            init();
        }

        return () => {
            isMounted.current = false;
            // Stop playing when unmounting or changing URL
            if (ws) {
                ws.pause();
                ws.destroy();
            }
        };
    }, [audioUrl, primaryColor]);

    // Cleanup when not hovering (isActive false) ? 
    // User wants manual control. If they mouse out, should it stop? 
    // Plan says "Plays on hover, pauses on leave" in the old plan, 
    // but new plan says "Remove auto-play on hover".
    // It implies persistence might be nice, but usually hover states reset on leave.
    // Let's pause on leave to keep it clean, or keeps playing?
    // "IsActive" comes from Hover. If user moves mouse away, overlay disappears.
    // So we must pause.
    useEffect(() => {
        if (!isActive && wavesurferRef.current) {
            wavesurferRef.current.pause();
            wavesurferRef.current.seekTo(0);
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()} // Stop propagation on entire overlay to allow seeking/clicking
        >
            {/* Play/Pause Button */}
            {isReady && (
                <button
                    onClick={togglePlay}
                    className="mb-4 p-4 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all transform hover:scale-110 active:scale-95 z-30"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
            )}

            {/* Waveform Container */}
            <div
                ref={containerRef}
                className="w-full h-[60px] cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            />
        </div>
    );
}
