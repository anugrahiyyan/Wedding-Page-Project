'use client';

import { useTransition, useState } from 'react';
import { deleteTier, updateTier } from '@/app/lib/actions';
import styles from './page.module.css';

interface TierRowProps {
    tier: {
        id: string;
        name: string;
        priceMin: number;
        priceMax: number;
        priceMinFormatted: string;
        priceMaxFormatted: string;
        features: string | null;
        color: string;
        sortOrder: number;
        templateCount: number;
    };
}

export function TierRow({ tier }: TierRowProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const features = tier.features ? tier.features.split(',').map(f => f.trim()).filter(Boolean) : [];

    async function handleDelete() {
        if (!confirm(`Delete tier "${tier.name}"? This cannot be undone.`)) return;

        startTransition(async () => {
            const result = await deleteTier(tier.id);
            if (!result.success) {
                setError(result.error || 'Failed to delete');
            }
        });
    }

    async function handleUpdate(formData: FormData) {
        startTransition(async () => {
            const result = await updateTier(tier.id, formData);
            if (result.success) {
                setIsEditing(false);
                setError(null);
            } else {
                setError(result.error || 'Failed to update');
            }
        });
    }

    if (isEditing) {
        return (
            <tr>
                <td colSpan={6}>
                    <form action={handleUpdate} className={styles.form} style={{ padding: '1rem 0' }}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label>Name</label>
                                <input className={styles.input} name="name" defaultValue={tier.name} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Sort Order</label>
                                <input className={styles.input} type="number" name="sortOrder" defaultValue={tier.sortOrder} />
                            </div>
                        </div>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label>Min Price (IDR)</label>
                                <input className={styles.input} type="number" name="priceMin" defaultValue={tier.priceMin} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Max Price (IDR)</label>
                                <input className={styles.input} type="number" name="priceMax" defaultValue={tier.priceMax} required />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Features (comma-separated)</label>
                            <input className={styles.input} name="features" defaultValue={tier.features || ''} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Badge Color</label>
                            <input className={styles.colorInput} type="color" name="color" defaultValue={tier.color} />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.actions}>
                            <button type="submit" className={styles.button} disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className={styles.editButton} onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td>
                <span className={styles.tierBadge} style={{ background: tier.color }}>
                    {tier.name}
                </span>
            </td>
            <td>
                <span className={styles.priceRange}>
                    IDR {tier.priceMinFormatted} - {tier.priceMaxFormatted}
                </span>
            </td>
            <td>
                <div className={styles.features}>
                    {features.length > 0 ? (
                        features.map((f, i) => (
                            <span key={i} className={styles.featureTag}>{f}</span>
                        ))
                    ) : (
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>-</span>
                    )}
                </div>
            </td>
            <td>{tier.templateCount}</td>
            <td>{tier.sortOrder}</td>
            <td>
                <div className={styles.actions}>
                    <button
                        className={styles.editButton}
                        onClick={() => setIsEditing(true)}
                        disabled={isPending}
                    >
                        Edit
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? '...' : 'Delete'}
                    </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
            </td>
        </tr>
    );
}
