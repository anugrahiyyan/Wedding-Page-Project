'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { UserForm } from './UserForm';
import { deleteUser } from '@/app/lib/actions';

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
}

interface UsersClientProps {
    users: User[];
}

export default function UsersClient({ users }: UsersClientProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>User Management</h1>
                <button className={styles.createButton} onClick={() => setShowModal(true)}>
                    + Add New Admin
                </button>
            </header>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Admin User</h2>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <UserForm onSuccess={() => setShowModal(false)} />
                    </div>
                </div>
            )}

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
                                        {/* Edit functionality remains as link for now, or can be converted to modal later */}
                                        <a href={`/dashboard/users/${user.id}/edit`} className={styles.button} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none', background: '#4b5563' }}>
                                            Edit
                                        </a>
                                        <form action={async () => {
                                            if (confirm('Are you sure you want to delete this user?')) {
                                                await deleteUser(user.id);
                                            }
                                        }}>
                                            <button type="submit" className={styles.deleteButton}>Delete</button>
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
