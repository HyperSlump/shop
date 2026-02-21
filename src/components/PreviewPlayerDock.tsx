'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconVolume,
    IconWaveSine,
    IconX
} from '@tabler/icons-react';

import { usePreviewPlayer } from './PreviewPlayerProvider';

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
    } = usePreviewPlayer();

    return (
        <AnimatePresence>
            {isOpen && currentTrack && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }}
                    className="fixed inset-x-0 bottom-0 z-[125] px-3 pb-3"
                >
                    <div className="mx-auto w-full max-w-[1480px] rounded-xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                        <div className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 md:px-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={togglePlayback}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
                                    aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                                >
                                    {isPlaying ? (
                                        <IconPlayerPauseFilled size={16} />
                                    ) : (
                                        <IconPlayerPlayFilled size={16} className="translate-x-[1px]" />
                                    )}
                                </button>

                                <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-background/70">
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

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">{currentTrack.title}</p>
                                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                                        {currentTrack.subtitle || 'audio preview'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
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

                            <div className="flex items-center justify-end gap-2">
                                <div className="hidden items-center gap-2 md:flex">
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}
