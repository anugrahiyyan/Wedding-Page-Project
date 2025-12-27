'use client';

import { useState } from 'react';
import styles from './page.module.css'; // We'll reuse/adapt styles or create new ones
import { TierForm } from './TierForm';
import { TierRow } from './TierRow';

interface Tier {
    id: string;
    name: string;
    priceMin: number;
    priceMax: number;
    features: string | null;
    sortOrder: number;
    color: string;
    // Add other fields as necessary from Prisma model
    _count: {
        templates: number;
    }
}

interface TiersClientProps {
    tiers: Tier[];
}

function formatIDR(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} jt`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
}

export default function TiersClient({ tiers }: TiersClientProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Tier Management</h1>
                <button className={styles.createButton} onClick={() => setShowModal(true)}>
                    + Add New Tier
                </button>
            </header>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Tier</h2>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <TierForm onSuccess={() => setShowModal(false)} />
                    </div>
                </div>
            )}

            <section className={styles.listSection}>
                <h2>Existing Tiers</h2>
                {tiers.length === 0 ? (
                    <p className={styles.emptyState}>No tiers created yet. Add your first tier above!</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price Range</th>
                                <th>Features</th>
                                <th>Templates</th>
                                <th>Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map((tier) => (
                                <TierRow
                                    key={tier.id}
                                    tier={{
                                        ...tier,
                                        priceMinFormatted: formatIDR(tier.priceMin),
                                        priceMaxFormatted: formatIDR(tier.priceMax),
                                        templateCount: tier._count.templates
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
