'use client'

import { useActionState } from 'react'
import { authenticate } from '@/app/lib/actions'
import styles from './page.module.css'

export default function Page() {
    // @ts-ignore
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <form action={dispatch} className={styles.form}>
                    <h1 className={styles.title}>Admin Login</h1>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="username">Username</label>
                        <input className={styles.input} type="text" name="username" placeholder="admin" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <input className={styles.input} type="password" name="password" placeholder="••••••" required />
                    </div>
                    <div aria-live="polite" aria-atomic="true">
                        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                    </div>
                    <button className={styles.button}>Sign in</button>
                </form>
            </div>
        </div>
    )
}
