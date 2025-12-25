'use client';

import { useState, useEffect } from 'react';
import { updateTemplate } from '@/app/lib/actions';
import styles from './editor.module.css';

export default function Editor({ template }: { template: any }) {
    const [content, setContent] = useState(template.content);
    const [thumbnail, setThumbnail] = useState(template.thumbnail || '');
    const [parsedContent, setParsedContent] = useState(JSON.parse(template.content));
    const [isSaving, setIsSaving] = useState(false);

    // Update parsed object when text changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        try {
            setParsedContent(JSON.parse(newContent));
        } catch (e) {
            // invalid json, ignore
        }
    };

    const [refreshKey, setRefreshKey] = useState(0);

    const handleSave = async () => {
        setIsSaving(true);
        await updateTemplate(template.id, content, thumbnail);
        setIsSaving(false);
        setRefreshKey(prev => prev + 1); // Force refresh after save
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Editing: {template.name}</h1>
                <div className={styles.headerActions}>
                    <input
                        type="url"
                        placeholder="Thumbnail URL (for homepage card)"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className={styles.thumbnailInput}
                    />
                    <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save & Refresh Preview'}
                    </button>
                </div>
            </header>
            <div className={styles.workspace}>
                <div className={styles.editorPane}>
                    <h2>Content (JSON)</h2>
                    <textarea
                        className={styles.textarea}
                        value={content}
                        onChange={handleContentChange}
                    />
                    {/* We could add form fields here that map to parsedContent */}
                </div>
                <div className={styles.previewPane}>
                    <h2>Live Preview (Updates on Save)</h2>
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

