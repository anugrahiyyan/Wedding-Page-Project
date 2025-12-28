'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
    const [status, setStatus] = useState<string>('');
    const [isError, setIsError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('Uploading...');
        setIsError(false);
        setIsUploading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch('/api/settings/ssl', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                setStatus('SSL Certificates installed successfully! Please restart the server using "node server.js" to apply changes.');
            } else {
                setStatus(data.error || 'Upload failed');
                setIsError(true);
            }
        } catch (err) {
            setStatus('An unexpected error occurred');
            setIsError(true);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>SSL Configuration</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fileInputGroup}>
                        <label className={styles.label} htmlFor="pem">Upload .pem File</label>
                        <input
                            type="file"
                            id="pem"
                            name="pem"
                            accept=".pem,.crt"
                            className={styles.fileInput}
                            required
                        />
                    </div>

                    <div className={styles.fileInputGroup}>
                        <label className={styles.label} htmlFor="key">Upload .key File</label>
                        <input
                            type="file"
                            id="key"
                            name="key"
                            accept=".key"
                            className={styles.fileInput}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : '💾 Save & Install SSL'}
                    </button>
                </form>

                {status && (
                    <p className={isError ? styles.statusError : styles.statusSuccess}>
                        {status}
                    </p>
                )}

                <div className={styles.notice}>
                    <strong>Note:</strong> After uploading, you must switch to running your server via the custom script.
                    <br />Run: <code>node server.js</code>
                </div>
            </section>
        </div>
    );
}
