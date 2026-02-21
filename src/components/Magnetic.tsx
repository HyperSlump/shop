'use client';

import { useEffect, useRef } from 'react';

interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    radius?: number;
    disabled?: boolean;
}

export default function Magnetic({
    children,
    className = '',
    strength = 14,
    radius = 0.95,
    disabled = false,
}: MagneticProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = rootRef.current;
        if (!node || disabled) return;
        if (typeof window === 'undefined') return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame: number | null = null;
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        const animate = () => {
            currentX += (targetX - currentX) * 0.22;
            currentY += (targetY - currentY) * 0.22;

            node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

            const done = Math.abs(targetX - currentX) < 0.04 && Math.abs(targetY - currentY) < 0.04;
            if (done) {
                if (targetX === 0 && targetY === 0) {
                    node.style.transform = 'translate3d(0px, 0px, 0px)';
                }
                frame = null;
                return;
            }

            frame = window.requestAnimationFrame(animate);
        };

        const request = () => {
            if (frame === null) {
                frame = window.requestAnimationFrame(animate);
            }
        };

        const reset = () => {
            targetX = 0;
            targetY = 0;
            request();
        };

        const onMove = (event: PointerEvent) => {
            const rect = node.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = event.clientX - centerX;
            const deltaY = event.clientY - centerY;
            const maxDistance = Math.max(rect.width, rect.height) * radius;
            const distance = Math.hypot(deltaX, deltaY);
            const attenuation = distance > maxDistance ? 0 : 1 - distance / maxDistance;

            targetX = (deltaX / (rect.width / 2)) * strength * attenuation;
            targetY = (deltaY / (rect.height / 2)) * strength * attenuation;
            request();
        };

        node.addEventListener('pointermove', onMove);
        node.addEventListener('pointerleave', reset);
        node.addEventListener('pointercancel', reset);
        node.addEventListener('focusout', reset);

        return () => {
            node.removeEventListener('pointermove', onMove);
            node.removeEventListener('pointerleave', reset);
            node.removeEventListener('pointercancel', reset);
            node.removeEventListener('focusout', reset);
            if (frame !== null) {
                window.cancelAnimationFrame(frame);
            }
            node.style.transform = '';
        };
    }, [disabled, radius, strength]);

    return (
        <div ref={rootRef} className={`magnetic-shell inline-flex ${className}`}>
            {children}
        </div>
    );
}
