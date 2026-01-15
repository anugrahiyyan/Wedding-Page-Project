import db from '@/lib/db';
import styles from './page.module.css';
import { toggleInvoiceStatus } from '@/app/lib/actions';
import DeleteInvoiceButton from '@/components/DeleteInvoiceButton';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const invoices = await db.invoice.findMany({
        where: { status: 'ARCHIVED' },
        orderBy: { updatedAt: 'desc' },
        include: { template: true }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Client History (Archived)</h1>

            <section className={styles.listSection}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Subdomain</th>
                            <th>Customer</th>
                            <th>Template</th>
                            <th>Archived Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No archived clients found.</td></tr>
                        ) : (
                            invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td>
                                        <span className={styles.dimmed}>{inv.subdomain}</span>
                                    </td>
                                    <td>{inv.customerName}</td>
                                    <td>{inv.template.name}</td>
                                    <td>{inv.updatedAt.toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <form action={async () => {
                                                'use server';
                                                await toggleInvoiceStatus(inv.id, 'ACTIVE');
                                            }}>
                                                <button className={styles.restoreBtn}>Restore</button>
                                            </form>
                                            <DeleteInvoiceButton id={inv.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
