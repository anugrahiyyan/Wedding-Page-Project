'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { deleteTemplate } from '@/app/lib/actions';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface Template {
    id: string;
    name: string;
    thumbnail: string | null;
    createdAt: Date;
    updatedAt: Date;
    content: string | null;
    isPublic: boolean;
    price: number | null;
}

interface TemplatesClientProps {
    templates: Template[];
}

export default function TemplatesClient({ templates }: TemplatesClientProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (template: { id: string, name: string }) => {
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        await deleteTemplate(templateToDelete.id);
        setIsDeleting(false);
        setShowDeleteModal(false);
        setTemplateToDelete(null);
    };

    return (
        <div>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                title="Delete Template"
                message={`Are you sure you want to delete template "${templateToDelete?.name}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                isDeleting={isDeleting}
            />

            <div className={styles.header}>
                <h1 className={styles.title}>Your Templates</h1>
                <Link href="/dashboard/templates/new" className={styles.createButton}>
                    + Create New Template
                </Link>
            </div>

            <div className={styles.grid}>
                {templates.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No templates yet. Create your first one!</p>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div key={template.id} className={styles.card}>


                            <div className={styles.cardPreview}>
                                {template.thumbnail ? (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Image
                                            src={template.thumbnail}
                                            alt={template.name}
                                            fill
                                            className={styles.thumbnail}
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.placeholderThumbnail} />
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{template.name}</h3>
                                <div className={styles.actions}>
                                    <Link href={`/editor/${template.id}`} className={styles.editLink}>Edit</Link>
                                    <Link href={`/preview/${template.id}`} target="_blank" className={styles.previewLink}>Preview</Link>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteClick({ id: template.id, name: template.name })}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
