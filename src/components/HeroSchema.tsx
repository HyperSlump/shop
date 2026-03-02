'use client';

import PromoCarousel from './PromoCarousel';

export default function HeroSchema() {
    return (
        <section className="relative w-full h-[100svh] min-h-[560px] sm:min-h-[700px] overflow-hidden bg-transparent">
            <div className="w-full h-full">
                {/* Full-bleed promo carousel */}
                <PromoCarousel />
            </div>
        </section>
    );
}
