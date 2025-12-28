'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { updateInvoiceContent } from '@/app/lib/actions';
import MediaManager from '@/components/MediaManager';
import styles from './editor.module.css';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function InvoiceEditor({ invoice, rootDomain }: { invoice: any, rootDomain: string }) {
    const [htmlContent, setHtmlContent] = useState(invoice.htmlContent || invoice.template.htmlContent || '');
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showMediaManager, setShowMediaManager] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateInvoiceContent(invoice.id, htmlContent);
        if (res.success) {
            setToast('Changes saved successfully!');
            setTimeout(() => setToast(null), 3000);
        }
        setIsSaving(false);
        setRefreshKey(prev => prev + 1);
    };

    const handleMediaSelect = (url: string) => {
        navigator.clipboard.writeText(url);
        setToast(`Copied URL: ${url}`);
        setTimeout(() => setToast(null), 3000);
        setShowMediaManager(false);
    };

    const previewUrl = invoice.subdomainMode === 'BASIC'
        ? `http://${rootDomain}/s/${invoice.subdomain}`
        : `http://${invoice.subdomain}.${rootDomain}`;

    return (
        <div className={styles.container}>
            {showMediaManager && (
                <MediaManager
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaManager(false)}
                />
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: '#4caf50', color: 'white', padding: '10px 20px', borderRadius: '50px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000, fontWeight: 'bold'
                }}>
                    ✅ {toast}
                </div>
            )}

            <header className={styles.header}>
                <div>
                    <h1>Editing Client: {invoice.customerName}</h1>
                    <p className={styles.subdomain}>{invoice.subdomain}.{rootDomain}</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.mediaButton}
                        onClick={() => setShowMediaManager(true)}
                        style={{
                            background: '#444',
                            marginRight: '1rem',
                            border: '1px solid #666',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🖼️ Media Manager
                    </button>
                    <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save & Update'}
                    </button>
                </div>
            </header>

            <div className={styles.workspace}>
                <div className={styles.editorPane}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.tabActive}`}>
                            🎨 HTML Editor
                        </button>
                    </div>

                    <div className={styles.monacoContainer}>
                        <MonacoEditor
                            height="100%"
                            language="html"
                            theme="vs-dark"
                            value={htmlContent}
                            onChange={(value) => setHtmlContent(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
                <div className={styles.previewPane}>
                    <h2>Live Preview</h2>
                    <iframe
                        src={previewUrl}
                        className={styles.iframe}
                        key={refreshKey}
                    />
                </div>
            </div>
        </div>
    );
}
