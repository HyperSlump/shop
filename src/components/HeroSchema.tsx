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
        <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-background">
            <div className="w-full h-full">
                {/* Full-bleed Promo Carousel — High impact hero content */}
                <PromoCarousel />
            </div>
        </section>
    );
}
