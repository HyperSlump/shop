'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
            document.documentElement.classList.toggle('light', savedTheme === 'light');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.add('light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="group border border-black dark:border-white p-4 text-center hover:border-primary transition-colors w-full max-w-[200px]"
        >
            <div className="text-[8px] uppercase tracking-[0.4em] mb-2 opacity-50 group-hover:text-primary group-hover:opacity-100 transition-all">
                System Mode
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span className={theme === 'dark' ? 'text-primary' : 'opacity-40'}>DARK</span>
                <span className="opacity-20">/</span>
                <span className={theme === 'light' ? 'text-primary' : 'opacity-40'}>LIGHT</span>
            </div>
        </button>
    );
}
