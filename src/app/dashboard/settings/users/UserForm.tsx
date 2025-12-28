'use client';

import { useTransition, useState } from 'react';
import { createUser } from '@/app/lib/actions';
import styles from './page.module.css';

export function UserForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            const result = await createUser(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                const form = document.getElementById('userForm') as HTMLFormElement;
                form?.reset();
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to create user' });
            }
        });
    }

    return (
        <form id="userForm" action={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <label>Username</label>
                <input
                    name="username"
                    placeholder="Username"
                    required
                    className={styles.input}
                    minLength={3}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Password (min 6 chars)"
                    required
                    className={styles.input}
                    minLength={6}
                />
            </div>

            {message && (
                <p className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </p>
            )}

            <button type="submit" className={styles.button} disabled={isPending}>
                {isPending ? 'Creating...' : 'Add User'}
            </button>
        </form>
    );
}
