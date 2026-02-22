'use client';

import React from 'react';
import GrainedNoise from './GrainedNoise';

interface AestheticBackgroundProps {
    showScanlines?: boolean;
    scanlineOpacity?: string;
    className?: string;
}

/**
 * Standardized background component for the hyper$lump project.
 * Unifies radial gradients, grained noise, and CRT scanlines.
 */
export default function AestheticBackground({
    showScanlines = true,
    scanlineOpacity = "opacity-10",
    className = ""
}: AestheticBackgroundProps) {
    return (
        <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
            {/* 1. The primary radial gradient layer (defined in globals.css) */}
            <div className="site-backdrop absolute inset-0 -z-20" aria-hidden />

            {/* 2. The standardized noise grain layer */}
            <GrainedNoise />

            {/* 3. The industrial scanning CRT overlay */}
            {showScanlines && (
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan ${scanlineOpacity} z-0`} />
            )}
        </div>
    );
}
