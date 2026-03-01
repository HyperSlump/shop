'use client';

import { useEffect, useState } from 'react';

export function useIsDarkMode() {
    const [isDark, setIsDark] = useState<boolean | null>(null);

    useEffect(() => {
        const root = document.documentElement;
        const sync = () => setIsDark(root.classList.contains('dark'));
        const observer = new MutationObserver(sync);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        const frameId = window.requestAnimationFrame(sync);

        return () => {
            window.cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, []);

    return isDark;
}
