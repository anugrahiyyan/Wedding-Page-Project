import db from '@/lib/db';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import RsvpPinForm from './RsvpPinForm';



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
                    <h1>🎊 Konfirmasi Tamu</h1>
                    <p>Masukkan PIN 6 digit untuk melihat daftar tamu</p>
                    <RsvpPinForm />
                    <p className={styles.hint}>PIN diberikan oleh admin undangan Anda</p>
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
                <h1>🎊 Konfirmasi Tamu</h1>
                <p className={styles.subtitle}>Pernikahan {invoice.customerName}</p>
            </header>

            <div className={styles.stats}>
                <div className={`${styles.statCard} ${styles.statAttending}`}>
                    <span className={styles.statNumber}>{attending.length}</span>
                    <span className={styles.statLabel}>Hadir</span>
                </div>
                <div className={`${styles.statCard} ${styles.statNotAttending}`}>
                    <span className={styles.statNumber}>{notAttending.length}</span>
                    <span className={styles.statLabel}>Tidak Hadir</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{invoice.rsvpSubmissions.length}</span>
                    <span className={styles.statLabel}>Total</span>
                </div>
            </div>

            <div className={styles.listsContainer}>
                <section className={`${styles.listSection} ${styles.attendingSection}`}>
                    <h2>✅ Hadir ({attending.length})</h2>
                    {attending.length === 0 ? (
                        <p className={styles.empty}>Belum ada konfirmasi</p>
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

                <section className={`${styles.listSection} ${styles.notAttendingSection}`}>
                    <h2>❌ Tidak Hadir ({notAttending.length})</h2>
                    {notAttending.length === 0 ? (
                        <p className={styles.empty}>Belum ada penolakan</p>
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
        </div>
    );
}
