'use client';

import { useActionState } from 'react';
import { createTemplate } from '@/app/lib/actions';
import styles from './page.module.css';

export default function NewTemplatePage() {
    // @ts-ignore
    const [errorMessage, dispatch, isPending] = useActionState(createTemplate, undefined);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create New Template</h1>
            <form action={dispatch} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="name">Template Name</label>
                    <input className={styles.input} type="text" name="name" placeholder="My Wedding Theme" required />
                </div>
                <div aria-live="polite">
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                </div>
                <button className={styles.button}>Create & Start Editing</button>
            </form>
        </div>
    );
}
