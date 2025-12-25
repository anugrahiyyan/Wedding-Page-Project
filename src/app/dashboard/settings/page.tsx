import { auth } from '@/auth';
import PasswordForm from './password-form';
import styles from './page.module.css';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div className={styles.container}>Error: Not authenticated</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>⚙️ Settings</h1>

            <section className={styles.section}>
                <h2>Change Password</h2>
                <PasswordForm userId={session.user.id} />
            </section>
        </div>
    );
}
