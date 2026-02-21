'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type PreviewTrack = {
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    audioUrl: string;
};

type PreviewPlayerContextType = {
    currentTrack: PreviewTrack | null;
    isOpen: boolean;
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    volume: number;
    playTrack: (track: PreviewTrack) => void;
    togglePlayback: () => void;
    closePlayer: () => void;
    seekTo: (time: number) => void;
    setVolume: (value: number) => void;
    isTrackActive: (id: string) => boolean;
    discoveredTracks: PreviewTrack[];
    registerTrack: (track: PreviewTrack) => void;
    unregisterTrack: (id: string) => void;
};

const PreviewPlayerContext = createContext<PreviewPlayerContextType | null>(null);

export function PreviewPlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<PreviewTrack | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(0.75);
    const [discoveredTracks, setDiscoveredTracks] = useState<PreviewTrack[]>([]);

    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.volume = volume;
        audioRef.current = audio;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onLoaded = () => {
            if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        };
        const onTime = () => setCurrentTime(audio.currentTime || 0);
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            audio.currentTime = 0;
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
    }, [volume]);

    const resolveUrl = (url: string) => {
        if (typeof window === 'undefined') return url;
        try {
            return new URL(url, window.location.href).toString();
        } catch {
            return url;
        }
    };

    const playTrack = useCallback((track: PreviewTrack) => {
        const audio = audioRef.current;
        if (!audio) return;

        setIsOpen(true);

        if (currentTrack?.id === track.id) {
            if (audio.paused) {
                void audio.play().catch(() => setIsPlaying(false));
            } else {
                audio.pause();
            }
            return;
        }

        audio.pause();
        const nextSrc = resolveUrl(track.audioUrl);
        const currentSrc = audio.currentSrc || audio.src;

        if (currentSrc !== nextSrc) {
            audio.src = track.audioUrl;
            audio.load();
        }

        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
    }, [currentTrack?.id]);

    const togglePlayback = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        if (audio.paused) {
            void audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    }, [currentTrack]);

    const closePlayer = useCallback(() => {
        const audio = audioRef.current;
        if (audio) audio.pause();
        setIsPlaying(false);
        setIsOpen(false);
    }, []);

    const seekTo = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const clamped = Math.max(0, Math.min(time, duration || 0));
        audio.currentTime = clamped;
        setCurrentTime(clamped);
    }, [duration]);

    const setVolume = useCallback((value: number) => {
        const next = Math.max(0, Math.min(1, value));
        const audio = audioRef.current;
        if (audio) audio.volume = next;
        setVolumeState(next);
    }, []);

    const isTrackActive = useCallback((id: string) => currentTrack?.id === id, [currentTrack?.id]);

    const registerTrack = useCallback((track: PreviewTrack) => {
        setDiscoveredTracks(prev => {
            if (prev.some(t => t.id === track.id)) return prev;
            return [...prev, track];
        });
    }, []);

    const unregisterTrack = useCallback((id: string) => {
        setDiscoveredTracks(prev => prev.filter(t => t.id !== id));
    }, []);

    const value = useMemo<PreviewPlayerContextType>(() => ({
        currentTrack,
        isOpen,
        isPlaying,
        duration,
        currentTime,
        volume,
        playTrack,
        togglePlayback,
        closePlayer,
        seekTo,
        setVolume,
        isTrackActive,
        discoveredTracks,
        registerTrack,
        unregisterTrack,
    }), [closePlayer, currentTime, currentTrack, duration, isOpen, isPlaying, isTrackActive, playTrack, seekTo, setVolume, togglePlayback, volume, discoveredTracks, registerTrack, unregisterTrack]);

    return (
        <PreviewPlayerContext.Provider value={value}>
            {children}
        </PreviewPlayerContext.Provider>
    );
}

export function usePreviewPlayer() {
    const context = useContext(PreviewPlayerContext);
    if (!context) {
        throw new Error('usePreviewPlayer must be used within PreviewPlayerProvider');
    }
    return context;
}
