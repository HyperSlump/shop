'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (!mounted) return <div className="h-6 w-24" />;

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-2 py-1 border border-primary/20 hover:border-primary/50 transition-all duration-300 group rounded-sm"
            title={isDark ? "SWITCH_TO_LIGHT_MODE" : "SWITCH_TO_DARK_MODE"}
        >
            <div className="flex items-center justify-center w-5 h-5">
                <span className="material-icons text-[16px] text-primary transition-transform duration-500 group-hover:rotate-12">
                    {isDark ? 'light_mode' : 'dark_mode'}
                </span>
            </div>
            <div className="h-[10px] w-[1px] bg-primary/20 group-hover:bg-primary/40" />
            <span className="font-mono text-[9px] text-primary/40 group-hover:text-primary transition-colors">
                {isDark ? "LT_MODE" : "DK_MODE"}
            </span>
        </button>
    );
}
