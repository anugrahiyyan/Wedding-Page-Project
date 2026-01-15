import db from '@/lib/db';
import styles from './overview.module.css';



export default async function DashboardOverview() {
    // Get stats
    const [
        totalInvoices,
        activeInvoices,
        archivedInvoices,
        totalTemplates,
        totalRsvps,
        recentInvoices
    ] = await Promise.all([
        db.invoice.count(),
        db.invoice.count({ where: { status: 'ACTIVE' } }),
        db.invoice.count({ where: { status: 'ARCHIVED' } }),
        db.template.count(),
        db.rsvpSubmission.count(),
        db.invoice.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { template: true }
        })
    ]);

    // Calculate actual revenue from all invoices
    const allInvoices = await db.invoice.findMany({
        select: { agreedPrice: true }
    });

    const totalRevenue = allInvoices.reduce((sum: number, inv: any) => sum + (inv.agreedPrice || 0), 0);

    function formatIDR(amount: number): string {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        }
        return amount.toString();
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Overview</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{activeInvoices}</span>
                        <span className={styles.statLabel}>Active Clients</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>IDR {formatIDR(totalRevenue)}</span>
                        <span className={styles.statLabel}>Total Revenue</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📄</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{totalTemplates}</span>
                        <span className={styles.statLabel}>Templates</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📝</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{totalRsvps}</span>
                        <span className={styles.statLabel}>Total RSVPs</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Summary</h2>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total Invoices</span>
                        <span className={styles.summaryValue}>{totalInvoices}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Active</span>
                        <span className={styles.summaryValueGreen}>{activeInvoices}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Archived</span>
                        <span className={styles.summaryValueGray}>{archivedInvoices}</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Recent Clients</h2>
                {recentInvoices.length === 0 ? (
                    <p className={styles.emptyState}>No clients yet</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Subdomain</th>
                                <th>Template</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td>{inv.customerName}</td>
                                    <td><code>{inv.subdomain}</code></td>
                                    <td>{inv.template.name}</td>
                                    <td>
                                        <span className={inv.status === 'ACTIVE' ? styles.badgeActive : styles.badgeArchived}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
