'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to update password');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>⚙️ Settings</h1>

            <section className={styles.section}>
                <h2>Change Password</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    {message && (
                        <p className={status === 'success' ? styles.success : styles.error}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </section>
        </div>
    );
}
