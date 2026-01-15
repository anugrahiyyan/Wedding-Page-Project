'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/Breadcrumb';

interface DashboardClientProps {
    children: React.ReactNode;
    signOutAction: () => Promise<void>;
}

export default function DashboardClient({ children, signOutAction }: DashboardClientProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('rabiku-sidebar-collapsed');
        if (saved === 'true') setCollapsed(true);
    }, []);

    // Auto-open settings if active
    useEffect(() => {
        if (pathname?.startsWith('/dashboard/settings')) {
            setSettingsOpen(true);
        }
    }, [pathname]);

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem('rabiku-sidebar-collapsed', String(newState));
        // Close settings when collapsing? Optional.
        if (newState) setSettingsOpen(false);
    };

    return (
        <div className={styles.container}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={`${styles.logo} text-foreground dark:text-white`}>{collapsed ? '🎊' : 'Rabikuu'}</div>
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

                    <div className={styles.navDivider} style={{ borderTop: '1px solid var(--sidebar-border)', margin: '0.5rem 0' }}></div>

                    {/* Settings Dropdown */}
                    <div>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => {
                                if (collapsed) {
                                    setCollapsed(false);
                                    setSettingsOpen(true);
                                } else {
                                    setSettingsOpen(!settingsOpen);
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className={styles.navIcon}>⚙️</span>
                                {!collapsed && <span>Settings</span>}
                            </div>
                            {!collapsed && (
                                <span className={`${styles.chevron} ${settingsOpen ? styles.chevronRotate : ''}`}>▼</span>
                            )}
                        </button>

                        <div className={`${styles.submenu} ${settingsOpen && !collapsed ? styles.submenuOpen : ''}`}>
                            <Link href="/dashboard/settings" className={styles.submenuItem}>
                                <span>🔧</span>
                                <span>General</span>
                                <span className={styles.arrowRight}>→</span>
                            </Link>
                            <Link href="/dashboard/settings/users" className={styles.submenuItem}>
                                <span>👥</span>
                                <span>Manage Users</span>
                                <span className={styles.arrowRight}>→</span>
                            </Link>
                        </div>
                    </div>
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
    );
}
