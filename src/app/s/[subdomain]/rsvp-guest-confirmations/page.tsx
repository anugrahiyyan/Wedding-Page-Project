import db from '@/lib/db';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function RsvpConfirmationsPage({
    params,
    searchParams
}: {
    params: Promise<{ subdomain: string }>,
    searchParams: Promise<{ token?: string }>
}) {
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;
    const token = resolvedSearch.token;

    const invoice = await db.invoice.findUnique({
        where: { subdomain: resolvedParams.subdomain },
        include: {
            rsvpSubmissions: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!invoice || invoice.status === 'ARCHIVED') {
        notFound();
    }

    // Token verification
    if (!token || invoice.accessToken !== token) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h1>🔒 Access Required</h1>
                    <p>Please enter your 6-digit access token to view guest confirmations.</p>
                    <form className={styles.tokenForm}>
                        <input
                            type="text"
                            name="token"
                            placeholder="Enter 6-digit token"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className={styles.tokenInput}
                        />
                        <button type="submit" className={styles.tokenButton}>Access</button>
                    </form>
                    <p className={styles.hint}>Token was provided by your wedding admin.</p>
                </div>
            </div>
        );
    }

    const attending = invoice.rsvpSubmissions.filter(r => r.attending);
    const notAttending = invoice.rsvpSubmissions.filter(r => !r.attending);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Guest Confirmations</h1>
                <p className={styles.subtitle}>Wedding of {invoice.customerName}</p>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{attending.length}</span>
                    <span className={styles.statLabel}>Attending</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{notAttending.length}</span>
                    <span className={styles.statLabel}>Not Attending</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{invoice.rsvpSubmissions.length}</span>
                    <span className={styles.statLabel}>Total Responses</span>
                </div>
            </div>

            <section className={styles.listSection}>
                <h2>✅ Attending ({attending.length})</h2>
                {attending.length === 0 ? (
                    <p className={styles.empty}>No confirmations yet.</p>
                ) : (
                    <ul className={styles.guestList}>
                        {attending.map(guest => (
                            <li key={guest.id} className={styles.guestItem}>
                                <strong>{guest.guestName}</strong>
                                {guest.email && <span className={styles.email}>{guest.email}</span>}
                                {guest.allergies && <span className={styles.allergies}>⚠️ {guest.allergies}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className={styles.listSection}>
                <h2>❌ Not Attending ({notAttending.length})</h2>
                {notAttending.length === 0 ? (
                    <p className={styles.empty}>No declines yet.</p>
                ) : (
                    <ul className={styles.guestList}>
                        {notAttending.map(guest => (
                            <li key={guest.id} className={styles.guestItem}>
                                <strong>{guest.guestName}</strong>
                                {guest.email && <span className={styles.email}>{guest.email}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
