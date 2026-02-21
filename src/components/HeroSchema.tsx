'use client';

import PromoCarousel from './PromoCarousel';

export default function HeroSchema() {
    return (
        <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-transparent">
            <div className="w-full h-full">
                {/* Full-bleed promo carousel */}
                <PromoCarousel />
            </div>
        </section>
    );
}
