'use client';

import { useTransition, useState } from 'react';
import { createTier } from '@/app/lib/actions';
import styles from './page.module.css';

export function TierForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            const result = await createTier(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Tier created successfully!' });
                const form = document.getElementById('tierForm') as HTMLFormElement;
                form?.reset();
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500); // Close after 1.5s to show success message
                }
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to create tier' });
            }
        });
    }

    return (
        <form id="tierForm" action={handleSubmit} className={styles.form}>
            <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">Tier Name</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="name"
                        id="name"
                        placeholder="e.g., Starter, Standard, Premium"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="sortOrder">Sort Order</label>
                    <input
                        className={styles.input}
                        type="number"
                        name="sortOrder"
                        id="sortOrder"
                        placeholder="0"
                        defaultValue={0}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="color">Badge Color</label>
                    <input
                        className={styles.colorInput}
                        type="color"
                        name="color"
                        id="color"
                        defaultValue="#646cff"
                    />
                </div>
            </div>
            <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                    <label htmlFor="priceMin">Min Price (IDR)</label>
                    <input
                        className={styles.input}
                        type="number"
                        name="priceMin"
                        id="priceMin"
                        placeholder="50000"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="priceMax">Max Price (IDR)</label>
                    <input
                        className={styles.input}
                        type="number"
                        name="priceMax"
                        id="priceMax"
                        placeholder="100000"
                        required
                    />
                </div>
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="features">Features (comma-separated)</label>
                <input
                    className={styles.input}
                    type="text"
                    name="features"
                    id="features"
                    placeholder="RSVP, Basic Template, No subdomain"
                />
            </div>
            {message && (
                <p className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </p>
            )}
            <button type="submit" className={styles.button} disabled={isPending}>
                {isPending ? 'Creating...' : 'Add Tier'}
            </button>
        </form>
    );
}
