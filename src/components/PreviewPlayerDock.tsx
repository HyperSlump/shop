'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconVolume,
    IconWaveSine,
    IconX,
    IconPlaylist,
    IconChevronUp
} from '@tabler/icons-react';

import { usePreviewPlayer, type PreviewTrack } from './PreviewPlayerProvider';
import { useState } from 'react';

function formatTime(value: number) {
    if (!Number.isFinite(value) || value <= 0) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PreviewPlayerDock() {
    const {
        currentTrack,
        isOpen,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlayback,
        closePlayer,
        seekTo,
        setVolume,
        discoveredTracks,
        playTrack,
        isTrackActive,
    } = usePreviewPlayer();

    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    const handleTrackSelect = (track: PreviewTrack) => {
        playTrack(track);
        // We could keep the playlist open or close it
        // setIsPlaylistOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && currentTrack && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }}
                    className="fixed inset-x-0 bottom-0 z-[125] px-3 pb-3 pointer-events-none"
                >
                    <div className="mx-auto w-full max-w-[1480px] pointer-events-auto">
                        <AnimatePresence>
                            {isPlaylistOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: 10 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: 10 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="overflow-hidden mb-2 rounded-lg border border-border/80 bg-card/95 shadow-[0_-12px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
                                >
                                    <div className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-5 px-1">
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className="jacquard-24-regular text-2xl leading-none text-foreground">Active Previews</h3>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/70">
                                                    Page Playlist / {discoveredTracks.length} tracks detected
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setIsPlaylistOpen(false)}
                                                className="p-1.5 text-muted hover:text-foreground transition-colors"
                                            >
                                                <IconX size={18} stroke={1.5} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
                                            {discoveredTracks.map((track) => {
                                                const isActive = isTrackActive(track.id);
                                                return (
                                                    <button
                                                        key={track.id}
                                                        onClick={() => handleTrackSelect(track)}
                                                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-left group
                                                            ${isActive
                                                                ? 'bg-primary/10 border border-primary/30'
                                                                : 'bg-background/40 border border-border/40 hover:bg-foreground/[0.03] hover:border-border/80'}`}
                                                    >
                                                        <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded border border-border/60">
                                                            {track.image ? (
                                                                <Image
                                                                    src={track.image}
                                                                    alt=""
                                                                    fill
                                                                    className={`object-cover transition-all duration-500 ${isActive ? 'scale-110' : 'grayscale-[0.3] group-hover:grayscale-0'}`}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted">
                                                                    <IconWaveSine size={14} />
                                                                </div>
                                                            )}
                                                            {isActive && isPlaying && (
                                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                                    <div className="flex gap-0.5 items-end h-3">
                                                                        <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-primary" />
                                                                        <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-primary" />
                                                                        <motion.div animate={{ height: [6, 12, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-primary" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-[13px] font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                                {track.title}
                                                            </p>
                                                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted truncate mt-0.5">
                                                                {track.subtitle}
                                                            </p>
                                                        </div>
                                                        <div className="mr-1">
                                                            {isActive && isPlaying ? (
                                                                <IconPlayerPauseFilled size={14} className="text-primary" />
                                                            ) : (
                                                                <IconPlayerPlayFilled size={14} className={`transition-opacity ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 text-muted'}`} />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="overflow-hidden rounded-lg border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                            <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:gap-4 md:px-4 md:py-3">
                                {/* Top row for mobile (Controls + Info + Close) / Left section for desktop */}
                                <div className="flex items-center justify-between md:w-auto md:justify-start md:gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={togglePlayback}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
                                            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                                        >
                                            {isPlaying ? (
                                                <IconPlayerPauseFilled size={16} />
                                            ) : (
                                                <IconPlayerPlayFilled size={16} className="translate-x-[1px]" />
                                            )}
                                        </button>

                                        <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-background/70 sm:block">
                                            {currentTrack.image ? (
                                                <Image
                                                    src={currentTrack.image}
                                                    alt={currentTrack.title}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted">
                                                    <IconWaveSine size={16} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 pr-2">
                                            <p className="truncate text-sm font-semibold text-foreground">{currentTrack.title}</p>
                                            <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                                                {currentTrack.subtitle || 'audio preview'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Close button visible on mobile here, moved to end on desktop */}
                                    <button
                                        type="button"
                                        onClick={closePlayer}
                                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background/55 text-muted transition-colors hover:border-primary/40 hover:text-foreground md:hidden"
                                        aria-label="Close preview player"
                                    >
                                        <IconX size={16} />
                                    </button>
                                </div>

                                {/* Playlist Toggle Button */}
                                <div className="flex items-center lg:border-r lg:border-border/50 lg:pr-4 lg:mr-1">
                                    <button
                                        onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] transition-all duration-300 group
                                        ${isPlaylistOpen
                                                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(216,58,61,0.2)]'
                                                : 'bg-background/40 text-muted hover:text-foreground hover:bg-background/60 border border-border/50'}`}
                                    >
                                        <IconPlaylist size={14} stroke={2} className={`${isPlaylistOpen ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
                                        <span className="hidden sm:inline">{isPlaylistOpen ? 'Hide Playlist' : 'Playlist'}</span>
                                        <IconChevronUp
                                            size={12}
                                            stroke={2.5}
                                            className={`transition-transform duration-500 sm:ml-0 ${isPlaylistOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Center section: Progress Bar */}
                                <div className="flex-1 space-y-1.5 pt-1 md:pt-0">
                                    <input
                                        type="range"
                                        min={0}
                                        max={duration > 0 ? duration : 1}
                                        step={0.01}
                                        value={currentTime}
                                        onChange={(event) => seekTo(Number(event.target.value))}
                                        className="h-1.5 w-full cursor-pointer accent-primary"
                                        aria-label={`Preview timeline for ${currentTrack.title}`}
                                    />
                                    <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-muted">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Right section for desktop (Volume + Close) */}
                                <div className="hidden items-center justify-end gap-3 md:flex">
                                    <div className="flex items-center gap-2">
                                        <IconVolume size={15} className="text-muted" />
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={volume}
                                            onChange={(event) => setVolume(Number(event.target.value))}
                                            className="h-1.5 w-20 cursor-pointer accent-primary"
                                            aria-label="Preview volume"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closePlayer}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/55 text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                                        aria-label="Close preview player"
                                    >
                                        <IconX size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
