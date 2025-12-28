'use client';

import styles from './page.module.css';

export default function RsvpPinForm() {
    return (
        <form method="GET" className={styles.pinForm}>
            <input
                type="tel"
                name="token"
                placeholder="• • • • • •"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                className={styles.pinInput}
                autoComplete="off"
                onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, '');
                }}
                required
            />
            <button type="submit" className={styles.pinButton}>Lihat Tamu</button>
        </form>
    );
}
