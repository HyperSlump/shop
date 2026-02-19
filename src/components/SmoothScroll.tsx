'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);
    const { isCartOpen } = useCart();
    const pathname = usePathname();

    const isCheckout = false; // Always allow scroll for now, or remove this logic if not needed

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.1, // More responsive (default is usually ~0.1, 0.05 was very floaty)
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0, // Standard scroll speed
            touchMultiplier: 2.0, // Better mobile responsiveness
            infinite: false,
        });

        lenisRef.current = lenis;

        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Handle scroll lock based on cart state
    useEffect(() => {
        const lenis = lenisRef.current;
        if (!lenis) return;

        if (isCartOpen) {
            lenis.stop();
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            lenis.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.touchAction = '';
        }
    }, [isCartOpen]);

    return <>{children}</>;
}
