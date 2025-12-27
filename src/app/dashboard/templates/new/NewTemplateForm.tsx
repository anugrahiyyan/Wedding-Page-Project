'use client';

import { useActionState } from 'react';
import { createTemplate } from '@/app/lib/actions';
import styles from './page.module.css';

interface Tier {
    id: string;
    name: string;
    priceMin: number;
    priceMax: number;
}

interface NewTemplateFormProps {
    tiers: Tier[];
}

function formatIDR(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} jt`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
}

export function NewTemplateForm({ tiers }: NewTemplateFormProps) {
    // @ts-ignore
    const [errorMessage, dispatch, isPending] = useActionState(createTemplate, undefined);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create New Template</h1>
            <form action={dispatch} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="name">Template Name *</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="name"
                        id="name"
                        placeholder="My Wedding Theme"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="description">Description</label>
                    <textarea
                        className={styles.textarea}
                        name="description"
                        id="description"
                        placeholder="A beautiful wedding template with elegant design..."
                    />
                </div>

                <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="tierId">Tier</label>
                        <select className={styles.select} name="tierId" id="tierId">
                            <option value="">-- Select Tier --</option>
                            {tiers.map((tier) => (
                                <option key={tier.id} value={tier.id}>
                                    {tier.name} (IDR {formatIDR(tier.priceMin)} - {formatIDR(tier.priceMax)})
                                </option>
                            ))}
                        </select>
                        <span className={styles.hint}>
                            {tiers.length === 0 && 'No tiers yet. Create them in Tier Management.'}
                        </span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="price">Price (IDR)</label>
                        <input
                            className={styles.input}
                            type="number"
                            name="price"
                            id="price"
                            placeholder="500000"
                        />
                        <span className={styles.hint}>Custom price for this template</span>
                    </div>
                </div>

                <div aria-live="polite">
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                </div>
                <button className={styles.button} disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create & Start Editing'}
                </button>
            </form>
        </div>
    );
}
