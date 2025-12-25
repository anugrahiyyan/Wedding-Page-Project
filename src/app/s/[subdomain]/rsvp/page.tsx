import db from '@/lib/db';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function RsvpPage({
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

    // Token verification - show PIN form if no token or invalid token
    if (!token || invoice.accessToken !== token) {
        return (
            <div className={styles.container}>
                <div className={styles.pinCard}>
                    <h1>🎊 Guest Confirmations</h1>
                    <p>Enter your 6-digit PIN to view who's attending</p>
                    <form className={styles.pinForm}>
                        <input
                            type="text"
                            name="token"
                            placeholder="• • • • • •"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className={styles.pinInput}
                            autoComplete="off"
                        />
                        <button type="submit" className={styles.pinButton}>View Guests</button>
                    </form>
                    <p className={styles.hint}>This PIN was provided by your wedding admin</p>
                </div>
            </div>
        );
    }

    // Token is valid - show guest list
    const attending = invoice.rsvpSubmissions.filter((r: any) => r.attending);
    const notAttending = invoice.rsvpSubmissions.filter((r: any) => !r.attending);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>🎊 Guest Confirmations</h1>
                <p className={styles.subtitle}>{invoice.customerName}'s Wedding</p>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{attending.length}</span>
                    <span className={styles.statLabel}>✅ Attending</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{notAttending.length}</span>
                    <span className={styles.statLabel}>❌ Not Attending</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{invoice.rsvpSubmissions.length}</span>
                    <span className={styles.statLabel}>📋 Total</span>
                </div>
            </div>

            <section className={styles.listSection}>
                <h2>✅ Attending ({attending.length})</h2>
                {attending.length === 0 ? (
                    <p className={styles.empty}>No confirmations yet</p>
                ) : (
                    <ul className={styles.guestList}>
                        {attending.map((guest: any) => (
                            <li key={guest.id} className={styles.guestItem}>
                                <strong>{guest.guestName}</strong>
                                {guest.email && <span className={styles.email}>{guest.email}</span>}
                                {guest.allergies && <span className={styles.allergies}>⚠️ {guest.allergies}</span>}
                                {guest.comment && <p className={styles.comment}>"{guest.comment}"</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className={styles.listSection}>
                <h2>❌ Not Attending ({notAttending.length})</h2>
                {notAttending.length === 0 ? (
                    <p className={styles.empty}>No declines yet</p>
                ) : (
                    <ul className={styles.guestList}>
                        {notAttending.map((guest: any) => (
                            <li key={guest.id} className={styles.guestItem}>
                                <strong>{guest.guestName}</strong>
                                {guest.comment && <p className={styles.comment}>"{guest.comment}"</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
