'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconMoonStars, IconSunHigh } from '@tabler/icons-react';


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

    if (!mounted) return <div className="h-8 w-14 rounded-sm border border-border/60 bg-card/40" />;

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.96 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
            className="relative h-8 w-14 rounded-sm border border-border/70 bg-card/70 p-1 backdrop-blur-sm transition-colors duration-200 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
            <motion.span
                className="pointer-events-none absolute inset-0 rounded-sm"
                animate={{
                    background: isDark
                        ? 'linear-gradient(120deg, rgba(216,58,61,0.22), rgba(123,170,178,0.16))'
                        : 'linear-gradient(120deg, rgba(123,170,178,0.24), rgba(200,106,131,0.2))'
                }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
            />

            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-foreground/50">
                <IconMoonStars size={12} stroke={1.9} />
            </span>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground/55">
                <IconSunHigh size={12} stroke={1.9} />
            </span>

            <motion.span
                className="relative z-10 flex h-6 w-6 items-center justify-center rounded-sm border border-border/80 bg-background text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.22)]"
                animate={{
                    x: isDark ? 0 : 24
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <motion.span
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex"
                >
                    {isDark ? (
                        <IconMoonStars size={13} stroke={2.1} />
                    ) : (
                        <IconSunHigh size={13} stroke={2.1} />
                    )}
                </motion.span>
            </motion.span>
        </motion.button>
    );
}
