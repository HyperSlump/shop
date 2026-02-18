'use client';

import { useState, useEffect } from 'react';
import PromoCarousel from './PromoCarousel';

export default function HeroSchema() {
    const [coordinates, setCoordinates] = useState("40.7128° N, 74.0060° W");

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const lat = (40.7128 + (e.clientX / window.innerWidth - 0.5) * 0.1).toFixed(4);
            const lng = (74.0060 + (e.clientY / window.innerHeight - 0.5) * 0.1).toFixed(4);
            setCoordinates(`${lat}° N, ${lng}° W`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="relative w-full bg-[var(--background)] animate-fade-in">
            <div className="w-full max-w-6xl mx-auto px-3 md:px-5 lg:px-6 py-4 md:py-6">
                {/* Promo Carousel — main hero content */}
                <div className="w-full flex justify-center">
                    <PromoCarousel />
                </div>
            </div>
        </section>
    );
}
