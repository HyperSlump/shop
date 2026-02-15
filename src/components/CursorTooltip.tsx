'use client';

import React, { useState, useEffect } from 'react';

interface CursorTooltipProps {
    text: string;
    children: React.ReactNode;
}

export default function CursorTooltip({ text, children }: CursorTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isVisible) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isVisible]);

    const handleMouseEnter = (e: React.MouseEvent) => {
        setPos({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
            className="flex items-center justify-center relative"
        >
            {children}
            {isVisible && (
                <div
                    className="fixed z-[1000] pointer-events-none px-3 py-1.5 bg-[var(--background)] text-primary text-[10px] font-mono tracking-[0.2em] border border-primary/40 shadow-[4px_4px_0px_rgba(var(--primary-rgb),0.2)] flex items-center gap-2 whitespace-nowrap"
                    style={{
                        left: pos.x + 20,
                        top: pos.y - 12
                    }}
                >
                    <div className="w-1 h-1 bg-primary animate-pulse" />
                    {text}
                </div>
            )}
        </div>
    );
}
