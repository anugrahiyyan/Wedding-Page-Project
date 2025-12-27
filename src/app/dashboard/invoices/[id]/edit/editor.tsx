'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { updateInvoiceContent } from '@/app/lib/actions';
import styles from './editor.module.css';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type EditorMode = 'json' | 'html';

export default function InvoiceEditor({ invoice, rootDomain }: { invoice: any, rootDomain: string }) {
    const [mode, setMode] = useState<EditorMode>('json');
    const [jsonContent, setJsonContent] = useState(invoice.templateContent || invoice.template.content);
    const [htmlContent, setHtmlContent] = useState(invoice.template.htmlContent || getDefaultHtmlTemplate());
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSave = async () => {
        setIsSaving(true);
        // For invoices, we save the JSON content to templateContent
        // HTML content is saved at template level, not invoice level
        await updateInvoiceContent(invoice.id, jsonContent);
        setIsSaving(false);
        setRefreshKey(prev => prev + 1);
    };

    const previewUrl = invoice.subdomainMode === 'BASIC'
        ? `http://${rootDomain}/s/${invoice.subdomain}`
        : `http://${invoice.subdomain}.${rootDomain}`;

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
                    {/* Tab buttons */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${mode === 'json' ? styles.tabActive : ''}`}
                            onClick={() => setMode('json')}
                        >
                            📋 JSON Editor
                        </button>
                        <button
                            className={`${styles.tab} ${mode === 'html' ? styles.tabActive : ''}`}
                            onClick={() => setMode('html')}
                        >
                            🎨 HTML Editor
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div className={styles.monacoContainer}>
                        {mode === 'json' ? (
                            <MonacoEditor
                                height="100%"
                                language="json"
                                theme="vs-dark"
                                value={jsonContent}
                                onChange={(value) => setJsonContent(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    formatOnPaste: true,
                                    formatOnType: true,
                                }}
                            />
                        ) : (
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
                        )}
                    </div>

                    {mode === 'html' && (
                        <p className={styles.hint}>
                            📌 HTML mode shows the template's HTML content (read-only for invoices). Edit at template level.
                        </p>
                    )}
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

function getDefaultHtmlTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Invitation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%);
            color: #fff;
            min-height: 100vh;
        }
        .hero {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .hero h1 {
            font-size: 3rem;
            color: #d4a68d;
            margin-bottom: 1rem;
        }
        .hero p {
            font-size: 1.25rem;
            color: #c9a892;
        }
    </style>
</head>
<body>
    <section class="hero">
        <h1>John & Jane</h1>
        <p>We're getting married!</p>
    </section>
</body>
</html>`;
}
