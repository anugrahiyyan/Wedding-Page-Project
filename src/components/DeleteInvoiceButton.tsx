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
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
                title="Delete Permanently"
            >
                Delete
            </button>
        </form>
    );
}
