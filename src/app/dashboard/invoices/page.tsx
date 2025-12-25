import db from '@/lib/db';
import styles from './page.module.css';
import { createInvoice, toggleInvoiceStatus } from '@/app/lib/actions';
import DeleteInvoiceButton from '@/components/DeleteInvoiceButton';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
    const invoices = await db.invoice.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: { template: true }
    });

    const templates = await db.template.findMany();
    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000'; // Default for safety

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Invoice Manager</h1>
                <p>Manage active subdomains and assignments.</p>
            </header>

            <section className={styles.createSection}>
                <h2>Create New Invoice</h2>
                <form action={createInvoice} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Customer Name</label>
                            <input name="customerName" placeholder="e.g. John Doe" required className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Template</label>
                            <select name="templateId" required className={styles.select}>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Subdomain</label>
                            <div className={styles.inputGroup}>
                                <input name="subdomain" placeholder="john-jane" required pattern="[a-z0-9-]+" className={styles.input} />
                                <span className={styles.suffix}>.{rootDomain}</span>
                            </div>
                        </div>
                        <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                            <button type="submit" className={styles.button}>Create Invoice</button>
                        </div>
                    </div>
                </form>
            </section>

            <section className={styles.listSection}>
                <div className={styles.listHeader}>
                    <h2>Active Invoices</h2>
                    <span className={styles.badge}>{invoices.length} Active</span>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Subdomain</th>
                            <th>Customer</th>
                            <th>Template</th>
                            <th>Access Token</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No active invoices. Create one above!</td></tr>
                        ) : (
                            invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td>
                                        <a href={`http://${inv.subdomain}.${rootDomain}`} target="_blank" className={styles.link}>
                                            {inv.subdomain}
                                        </a>
                                    </td>
                                    <td>{inv.customerName}</td>
                                    <td>{inv.template.name}</td>
                                    <td>
                                        <code className={styles.token}>{inv.accessToken}</code>
                                    </td>
                                    <td>{inv.createdAt.toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <a href={`/dashboard/invoices/${inv.id}/edit`} className={styles.editBtn}>Edit</a>
                                            <form action={async () => {
                                                'use server';
                                                await toggleInvoiceStatus(inv.id, 'ARCHIVED');
                                            }}>
                                                <button className={styles.archiveBtn} title="Archive (Finish)">Archive</button>
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
