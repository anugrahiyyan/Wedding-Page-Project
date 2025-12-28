'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { updateTemplate } from '@/app/lib/actions';
import MediaManager from '@/components/MediaManager';
import styles from './editor.module.css';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Editor({ template }: { template: any }) {
    // Default to HTML mode only
    const [htmlContent, setHtmlContent] = useState(template.htmlContent || getDefaultHtmlTemplate());
    const [thumbnail, setThumbnail] = useState(template.thumbnail || '');
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showMediaManager, setShowMediaManager] = useState(false);

    const [mediaTarget, setMediaTarget] = useState<'clipboard' | 'thumbnail'>('clipboard');

    const handleSave = async () => {
        setIsSaving(true);
        // Save only HTML content (jsonContent is now legacy/unused)
        await updateTemplate(template.id, '{}', thumbnail, htmlContent);
        setIsSaving(false);
        setRefreshKey(prev => prev + 1);
    };

    const [toast, setToast] = useState<string | null>(null);

    const handleMediaSelect = (url: string) => {
        if (mediaTarget === 'thumbnail') {
            setThumbnail(url);
            setShowMediaManager(false);
        } else {
            navigator.clipboard.writeText(url);
            setToast(`Copied: ${url}`);
            setTimeout(() => setToast(null), 3000);
            setShowMediaManager(false);
        }
    };

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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000, fontWeight: 'bold',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    ✅ {toast}
                </div>
            )}

            <header className={styles.header}>
                <h1>Editing: {template.name}</h1>
                <div className={styles.headerActions}>
                    <button
                        className={styles.mediaButton}
                        onClick={() => { setMediaTarget('clipboard'); setShowMediaManager(true); }}
                        style={{ background: '#444', marginRight: '1rem', border: '1px solid #666', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🖼️ Media Manager
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="url"
                            placeholder="Thumbnail URL"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            className={styles.thumbnailInput}
                            style={{ width: '300px' }}
                        />
                        <button
                            onClick={() => { setMediaTarget('thumbnail'); setShowMediaManager(true); }}
                            style={{ background: '#2d3748', border: '1px solid #4a5568', color: 'white', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Upload
                        </button>
                    </div>
                    <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save & Refresh Preview'}
                    </button>
                </div>
            </header>

            <div className={styles.workspace}>
                <div className={styles.editorPane}>
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
                        src={`/preview/${template.id}`}
                        className={styles.iframe}
                        key={refreshKey}
                    />
                </div>
            </div>
        </div>
    );
}

function getDefaultHtmlTemplate(): string {
    // Fallback if DB is empty, though new templates should use the Action default
    return `<!DOCTYPE html>...`;
}
