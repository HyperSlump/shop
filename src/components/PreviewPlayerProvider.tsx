'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from './CartProvider';

export type PreviewTrack = {
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    audioUrl: string;
    loopStart?: number;
    loopEnd?: number;
    cartProduct?: Product;
};

type PreviewPlayerContextType = {
    currentTrack: PreviewTrack | null;
    isOpen: boolean;
    isPlaying: boolean;
    isLoopEnabled: boolean;
    duration: number;
    currentTime: number;
    volume: number;
    playTrack: (track: PreviewTrack) => void;
    togglePlayback: () => void;
    toggleLoop: () => void;
    closePlayer: () => void;
    seekTo: (time: number) => void;
    setVolume: (value: number) => void;
    isTrackActive: (id: string) => boolean;
    discoveredTracks: PreviewTrack[];
    registerTrack: (track: PreviewTrack) => void;
    unregisterTrack: (id: string) => void;
};

const PreviewPlayerContext = createContext<PreviewPlayerContextType | null>(null);

const CUSTOM_LOOP_GUARD_SECONDS = 0.03;
const LOOP_TIME_EPSILON_SECONDS = 0.001;
const MIN_LOOP_WINDOW_SECONDS = 0.1;

type LoopWindow = {
    start: number;
    end: number;
};

function getTrackLoopWindow(track: PreviewTrack | null, totalDuration: number): LoopWindow | null {
    if (!track || !Number.isFinite(totalDuration) || totalDuration <= 0) return null;

    const rawStart = Number.isFinite(track.loopStart) ? track.loopStart ?? 0 : 0;
    const rawEnd = Number.isFinite(track.loopEnd) ? track.loopEnd ?? totalDuration : totalDuration;
    const start = Math.max(0, Math.min(rawStart, totalDuration));
    const end = Math.max(0, Math.min(rawEnd, totalDuration));

    if (end - start < MIN_LOOP_WINDOW_SECONDS) return null;

    return { start, end };
}

function hasCustomLoopWindow(loopWindow: LoopWindow | null, totalDuration: number) {
    if (!loopWindow || !Number.isFinite(totalDuration) || totalDuration <= 0) return false;

    return (
        loopWindow.start > LOOP_TIME_EPSILON_SECONDS ||
        loopWindow.end < totalDuration - LOOP_TIME_EPSILON_SECONDS
    );
}

function wrapTimeIntoLoopWindow(time: number, loopWindow: LoopWindow) {
    const loopLength = loopWindow.end - loopWindow.start;

    if (loopLength < MIN_LOOP_WINDOW_SECONDS) return loopWindow.start;
    if (time < loopWindow.start) return Math.max(0, time);
    if (time < loopWindow.end) return time;

    return loopWindow.start + ((time - loopWindow.start) % loopLength);
}

export function PreviewPlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const loopMonitorRef = useRef<number | null>(null);
    const currentTrackRef = useRef<PreviewTrack | null>(null);
    const durationRef = useRef(0);
    const isLoopEnabledRef = useRef(true);
    const [currentTrack, setCurrentTrack] = useState<PreviewTrack | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoopEnabled, setIsLoopEnabled] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(0.75);
    const [discoveredTracks, setDiscoveredTracks] = useState<PreviewTrack[]>([]);

    const stopLoopMonitor = useCallback(() => {
        if (loopMonitorRef.current !== null) {
            window.cancelAnimationFrame(loopMonitorRef.current);
            loopMonitorRef.current = null;
        }
    }, []);

    const syncLoopMode = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const totalDuration = durationRef.current || audio.duration || 0;
        const loopWindow = getTrackLoopWindow(currentTrackRef.current, totalDuration);
        const shouldUseNativeLoop = isLoopEnabledRef.current && !hasCustomLoopWindow(loopWindow, totalDuration);

        audio.loop = shouldUseNativeLoop;
    }, []);

    const normalizeTimeForLoop = useCallback((time: number) => {
        const totalDuration = durationRef.current;
        const clamped = Math.max(0, Math.min(time, totalDuration || 0));

        if (!isLoopEnabledRef.current) return clamped;

        const loopWindow = getTrackLoopWindow(currentTrackRef.current, totalDuration);
        if (!loopWindow || !hasCustomLoopWindow(loopWindow, totalDuration)) return clamped;

        return wrapTimeIntoLoopWindow(clamped, loopWindow);
    }, []);

    const maybeWrapCustomLoop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !isLoopEnabledRef.current) return false;

        const totalDuration = durationRef.current || audio.duration || 0;
        const loopWindow = getTrackLoopWindow(currentTrackRef.current, totalDuration);
        if (!loopWindow || !hasCustomLoopWindow(loopWindow, totalDuration)) return false;

        const loopLength = loopWindow.end - loopWindow.start;
        const guard = Math.min(CUSTOM_LOOP_GUARD_SECONDS, Math.max(loopLength / 4, 0.01));

        if (audio.currentTime < loopWindow.end - guard) return false;

        const overshoot = Math.max(0, audio.currentTime - loopWindow.end);
        const nextTime = Math.min(
            loopWindow.start + overshoot,
            Math.max(loopWindow.start, loopWindow.end - 0.01)
        );

        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
        return true;
    }, []);

    const startLoopMonitor = useCallback(() => {
        if (loopMonitorRef.current !== null) return;

        const tick = () => {
            const audio = audioRef.current;
            if (!audio || audio.paused) {
                loopMonitorRef.current = null;
                return;
            }

            maybeWrapCustomLoop();
            loopMonitorRef.current = window.requestAnimationFrame(tick);
        };

        loopMonitorRef.current = window.requestAnimationFrame(tick);
    }, [maybeWrapCustomLoop]);

    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.75;
        audio.loop = true;
        audioRef.current = audio;

        const onPlay = () => {
            setIsPlaying(true);
            startLoopMonitor();
        };
        const onPause = () => {
            setIsPlaying(false);
            stopLoopMonitor();
        };
        const onLoaded = () => {
            const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
            durationRef.current = nextDuration;
            setDuration(nextDuration);

            const normalizedTime = normalizeTimeForLoop(audio.currentTime || 0);
            if (Math.abs((audio.currentTime || 0) - normalizedTime) > LOOP_TIME_EPSILON_SECONDS) {
                audio.currentTime = normalizedTime;
            }

            syncLoopMode();
        };
        const onTime = () => {
            if (maybeWrapCustomLoop()) return;
            setCurrentTime(audio.currentTime || 0);
        };
        const onEnded = () => {
            if (maybeWrapCustomLoop()) {
                void audio.play().catch(() => setIsPlaying(false));
                return;
            }
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
            stopLoopMonitor();
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('ended', onEnded);
        };
    }, [maybeWrapCustomLoop, normalizeTimeForLoop, startLoopMonitor, stopLoopMonitor, syncLoopMode]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
    }, [volume]);

    useEffect(() => {
        isLoopEnabledRef.current = isLoopEnabled;
        const audio = audioRef.current;
        if (!audio) return;

        syncLoopMode();

        const normalizedTime = normalizeTimeForLoop(audio.currentTime || 0);
        if (Math.abs((audio.currentTime || 0) - normalizedTime) > LOOP_TIME_EPSILON_SECONDS) {
            audio.currentTime = normalizedTime;
            audio.dispatchEvent(new Event('timeupdate'));
        }

        if (isLoopEnabled && !audio.paused) {
            startLoopMonitor();
            return;
        }

        stopLoopMonitor();
    }, [isLoopEnabled, normalizeTimeForLoop, startLoopMonitor, stopLoopMonitor, syncLoopMode]);

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

        if (currentTrackRef.current?.id === track.id) {
            if (audio.paused) {
                void audio.play().catch(() => setIsPlaying(false));
            } else {
                audio.pause();
            }
            return;
        }

        stopLoopMonitor();
        audio.pause();
        const nextSrc = resolveUrl(track.audioUrl);
        const currentSrc = audio.currentSrc || audio.src;

        currentTrackRef.current = track;
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        durationRef.current = 0;
        audio.currentTime = 0;
        syncLoopMode();

        if (currentSrc !== nextSrc) {
            audio.src = nextSrc;
            audio.load();
        }

        void audio.play().catch(() => setIsPlaying(false));
    }, [stopLoopMonitor, syncLoopMode]);

    const togglePlayback = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrackRef.current) return;

        if (audio.paused) {
            void audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    }, []);

    const toggleLoop = useCallback(() => {
        setIsLoopEnabled(prev => !prev);
    }, []);

    const closePlayer = useCallback(() => {
        const audio = audioRef.current;
        if (audio) audio.pause();
        setIsPlaying(false);
        setIsOpen(false);
    }, []);

    const seekTo = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const normalizedTime = normalizeTimeForLoop(time);
        audio.currentTime = normalizedTime;
        setCurrentTime(normalizedTime);
        maybeWrapCustomLoop();
    }, [maybeWrapCustomLoop, normalizeTimeForLoop]);

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
        isLoopEnabled,
        duration,
        currentTime,
        volume,
        playTrack,
        togglePlayback,
        toggleLoop,
        closePlayer,
        seekTo,
        setVolume,
        isTrackActive,
        discoveredTracks,
        registerTrack,
        unregisterTrack,
    }), [closePlayer, currentTime, currentTrack, duration, isLoopEnabled, isOpen, isPlaying, isTrackActive, playTrack, seekTo, setVolume, toggleLoop, togglePlayback, volume, discoveredTracks, registerTrack, unregisterTrack]);

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
