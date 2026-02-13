'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface OneShotPlayerProps {
    audioUrl: string;
    label?: string;
}

export default function OneShotPlayer({ audioUrl, label }: OneShotPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio instance
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Cleanup
        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            audio.currentTime = 0; // Reset to start for one-shots usually
            setIsPlaying(false);
        } else {
            // Stop other audio if needed? For now just play.
            audio.play().catch(err => console.error("Audio play failed", err));
            setIsPlaying(true);
        }
    };

    return (
        <button
            onClick={togglePlay}
            className={`
                group flex items-center justify-center gap-2 
                w-full p-2 h-10
                border-2 border-primary/20 hover:border-primary 
                bg-black/50 hover:bg-primary/10 
                transition-all duration-200 
                rounded-sm
                ${isPlaying ? 'border-primary bg-primary/20' : ''}
            `}
            title={label || 'Play Sample'}
        >
            {isPlaying ? (
                <Pause size={16} className="text-primary fill-current" />
            ) : (
                <Play size={16} className="text-primary fill-current" />
            )}
            {label && (
                <span className="font-mono text-[10px] text-primary uppercase">
                    {label}
                </span>
            )}
        </button>
    );
}
