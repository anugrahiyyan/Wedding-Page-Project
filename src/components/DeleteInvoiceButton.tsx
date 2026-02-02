'use client';

import { deleteInvoice } from '@/app/lib/actions';

export default function DeleteInvoiceButton({ id }: { id: string }) {
    return (
        <form action={async () => {
            await deleteInvoice(id);
        }} onSubmit={(e) => {
            if (!confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
                e.preventDefault();
            }
        }}>
            <button
                type="submit"
                style={{
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#dc2626';
                }}
                title="Delete Permanently"
            >
                Delete
            </button>
        </form>
    );
}
