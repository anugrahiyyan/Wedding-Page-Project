'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumb.module.css';

const pathNameMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'templates': 'Templates',
    'tiers': 'Tiers',
    'invoices': 'Invoices',
    'history': 'Client History',
    'users': 'Users',
    'new': 'New',
    'edit': 'Edit',
};

export default function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length <= 1) return null;

    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = pathNameMap[segment] || segment;
        const isLast = index === segments.length - 1;

        return (
            <span key={href} className={styles.item}>
                {index > 0 && <span className={styles.separator}>/</span>}
                {isLast ? (
                    <span className={styles.current}>{label}</span>
                ) : (
                    <Link href={href} className={styles.link}>{label}</Link>
                )}
            </span>
        );
    });

    return <nav className={styles.breadcrumb}>{breadcrumbs}</nav>;
}
