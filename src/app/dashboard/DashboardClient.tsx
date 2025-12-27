'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/Breadcrumb';

interface DashboardClientProps {
    children: React.ReactNode;
    signOutAction: () => Promise<void>;
}

export default function DashboardClient({ children, signOutAction }: DashboardClientProps) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('rabiku-sidebar-collapsed');
        if (saved === 'true') setCollapsed(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem('rabiku-sidebar-collapsed', String(newState));
    };

    return (
        <ThemeProvider>
            <div className={styles.container}>
                <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.logo}>{collapsed ? '🎊' : 'Rabiku'}</div>
                        <button
                            className={`${styles.collapseButton} ${collapsed ? styles.collapseButtonExpanded : ''}`}
                            onClick={toggleSidebar}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? '→' : '←'}
                        </button>
                    </div>
                    <nav className={styles.nav}>
                        <Link href="/dashboard" className={styles.navItem}>
                            <span className={styles.navIcon}>📊</span>
                            {!collapsed && <span>Dashboard</span>}
                        </Link>
                        <Link href="/dashboard/templates" className={styles.navItem}>
                            <span className={styles.navIcon}>📄</span>
                            {!collapsed && <span>Templates</span>}
                        </Link>
                        <Link href="/dashboard/tiers" className={styles.navItem}>
                            <span className={styles.navIcon}>🏷️</span>
                            {!collapsed && <span>Tiers</span>}
                        </Link>
                        <Link href="/dashboard/invoices" className={styles.navItem}>
                            <span className={styles.navIcon}>📋</span>
                            {!collapsed && <span>Invoices</span>}
                        </Link>
                        <Link href="/dashboard/history" className={styles.navItem}>
                            <span className={styles.navIcon}>📜</span>
                            {!collapsed && <span>Client History</span>}
                        </Link>
                        <Link href="/dashboard/users" className={styles.navItem}>
                            <span className={styles.navIcon}>👤</span>
                            {!collapsed && <span>Users</span>}
                        </Link>
                    </nav>
                    <div className={styles.sidebarFooter}>
                        <ThemeToggle collapsed={collapsed} />
                        <form action={signOutAction}>
                            <button className={styles.logoutButton}>
                                {collapsed ? '🚪' : 'Sign Out'}
                            </button>
                        </form>
                    </div>
                </aside>
                <main className={styles.main}>
                    <Breadcrumb />
                    <div className={styles.mainContent}>{children}</div>
                </main>
            </div>
        </ThemeProvider>
    );
}
