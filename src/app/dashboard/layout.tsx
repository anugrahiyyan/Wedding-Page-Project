import Link from 'next/link';
import { signOut } from '@/auth';
import styles from './dashboard.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>WeddingAdmin</div>
                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navItem}>
                        Templates
                    </Link>
                    <Link href="/dashboard/users" className={styles.navItem}>
                        Users
                    </Link>
                    <Link href="/dashboard/invoices" className={styles.navItem}>
                        Invoices
                    </Link>
                    <Link href="/dashboard/history" className={styles.navItem}>
                        Client History
                    </Link>
                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <button className={styles.logoutButton}>Sign Out</button>
                    </form>
                </nav>
            </aside>
            <main className={styles.main}>{children}</main>
        </div>
    );
}
