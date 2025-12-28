'use client';

import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isDeleting = false,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--card-bg, #1e293b)',
                border: '1px solid var(--card-border, #334155)',
                borderRadius: '12px',
                padding: '2rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    marginTop: 0,
                    marginBottom: '1rem',
                    color: 'var(--foreground, #fff)',
                    fontSize: '1.5rem'
                }}>{title}</h2>
                <p style={{
                    color: 'var(--text-muted, #94a3b8)',
                    marginBottom: '2rem'
                }}>{message}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid var(--card-border, #334155)',
                            color: 'var(--foreground, #fff)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#ef4444',
                            border: 'none',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            opacity: isDeleting ? 0.7 : 1
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
