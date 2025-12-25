'use client';

import { useState } from 'react';
import { updateInvoiceContent } from '@/app/lib/actions';
import styles from './editor.module.css';

export default function InvoiceEditor({ invoice, rootDomain }: { invoice: any, rootDomain: string }) {
    const [content, setContent] = useState(invoice.templateContent || invoice.template.content);
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSave = async () => {
        setIsSaving(true);
        await updateInvoiceContent(invoice.id, content);
        setIsSaving(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Editing: {invoice.customerName}</h1>
                    <p className={styles.subdomain}>{invoice.subdomain}.{rootDomain}</p>
                </div>
                <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save & Update'}
                </button>
            </header>
            <div className={styles.workspace}>
                <div className={styles.editorPane}>
                    <h2>Template Content (JSON)</h2>
                    <textarea
                        className={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className={styles.previewPane}>
                    <h2>Live Preview</h2>
                    <iframe
                        src={`http://${invoice.subdomain}.${rootDomain}`}
                        className={styles.iframe}
                        key={refreshKey}
                    />
                </div>
            </div>
        </div>
    );
}
