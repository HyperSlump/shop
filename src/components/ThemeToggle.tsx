'use client';

import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';

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
            className="flex items-center justify-center hover:text-primary transition-colors group"
            title={isDark ? "SWITCH_TO_LIGHT_MODE" : "SWITCH_TO_DARK_MODE"}
        >
            <Brain
                size={22}
                className="transition-transform group-hover:scale-110"
            />
        </button>
    );
}
