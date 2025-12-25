import Link from 'next/link';
import db from '@/lib/db';
import styles from './page.module.css';
import { deleteTemplate } from '@/app/lib/actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const templates = await db.template.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Templates</h1>
                <Link href="/dashboard/templates/new" className={styles.createButton}>
                    + Create New Template
                </Link>
            </div>

            <div className={styles.grid}>
                {templates.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No templates yet. Create your first one!</p>
                    </div>
                ) : (
                    templates.map((template: any) => (
                        <div key={template.id} className={styles.card}>
                            <div className={styles.cardPreview}>
                                {/* Thumbnail would go here */}
                                <div className={styles.placeholderThumbnail} />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{template.name}</h3>
                                <div className={styles.actions}>
                                    <Link href={`/dashboard/templates/${template.id}`} className={styles.editLink}>Edit</Link>
                                    <Link href={`/preview/${template.id}`} target="_blank" className={styles.previewLink}>Preview</Link>
                                    <form action={async () => {
                                        'use server';
                                        await deleteTemplate(template.id);
                                    }}>
                                        <button className={styles.deleteButton}>Delete</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
