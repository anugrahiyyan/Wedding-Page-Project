'use client';

import { useState } from 'react';
import { updateUser } from '@/app/lib/actions';
import styles from './editor.module.css';

export default function UserEditor({ user }: { user: any }) {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        const res = await updateUser(user.id, username, password);

        if (res.success) {
            setMessage('User updated successfully!');
            setPassword(''); // Clear password field
        } else {
            setMessage(res.error || 'Failed to update');
        }

        setIsSaving(false);
    };

    return (
        <div className={styles.container}>
            <h1>Edit User: {user.username}</h1>
            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Username</label>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>New Password (leave blank to keep current)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••"
                        className={styles.input}
                    />
                </div>

                {message && <p className={message.includes('success') ? styles.success : styles.error}>{message}</p>}

                <div className={styles.actions}>
                    <button type="submit" disabled={isSaving} className={styles.saveBtn}>
                        {isSaving ? 'Saving...' : 'Update User'}
                    </button>
                    <a href="/dashboard/settings/users" className={styles.cancelLink}>Cancel</a>
                </div>
            </form>
        </div>
    );
}
