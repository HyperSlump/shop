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
}: WaveformOverlayProps) {
    const primaryColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#ccff00' : '#ccff00';
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

            const isDark = document.documentElement.classList.contains('dark');
            const waveColor = isDark ? '#333333' : '#000000'; // Black in light mode per request

            ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: waveColor,
                progressColor: primaryColor,
                cursorColor: primaryColor,
                barWidth: 3,
                barGap: 1,
                barRadius: 2,
                height: 48,
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
            className="absolute inset-0 group cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                if (wavesurferRef.current) {
                    wavesurferRef.current.playPause();
                }
            }}
        >
            {/* Play/Pause Button - Larger Hitbox for Mobile */}
            {isReady && (
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center z-30 pointer-events-none">
                    <div className="p-2 transition-all">
                        {isPlaying ? (
                            <Pause size={18} className="text-primary fill-current" />
                        ) : (
                            <Play size={18} className="text-white group-hover:text-primary fill-current transition-colors" />
                        )}
                    </div>
                </div>
            )}

            {/* Waveform Container - Offset to the right of the button */}
            <div
                ref={containerRef}
                className="absolute inset-x-0 bottom-0 left-10 top-6"
            />
        </div>
    );
}
