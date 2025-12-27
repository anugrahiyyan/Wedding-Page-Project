'use client';

import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
    const { theme, toggleTheme } = useTheme();

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
