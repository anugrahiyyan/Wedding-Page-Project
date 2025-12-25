import db from '@/lib/db';
import styles from './page.module.css';
import { createUser, deleteUser } from '@/app/lib/actions';


export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Management</h1>

            <section className={styles.createSection}>
                <h2>Add New Admin User</h2>
                <form action={createUser} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input name="username" placeholder="Username" required className={styles.input} />
                        <input name="password" type="password" placeholder="Password" required className={styles.input} />
                        <button type="submit" className={styles.button}>Add User</button>
                    </div>
                </form>
            </section>

            <section className={styles.listSection}>
                <h2>Existing Users</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td>{user.createdAt.toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a href={`/dashboard/users/${user.id}/edit`} className={styles.button} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none', background: '#4b5563' }}>
                                            Edit
                                        </a>
                                        <form action={async () => {
                                            'use server';
                                            await deleteUser(user.id);
                                        }}>
                                            <button className={styles.deleteButton}>Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
