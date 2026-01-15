'use client';

import { useTheme } from 'next-themes';
import styles from './ThemeToggle.module.css';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
            {!collapsed && (
                <span className={styles.label}>
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
            )}
        </button>
    );
}
