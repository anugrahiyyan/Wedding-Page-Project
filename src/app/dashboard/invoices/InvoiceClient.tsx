'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { createInvoice, toggleInvoiceStatus, updateInvoiceMode, deleteInvoice, updateInvoice } from '@/app/lib/actions';
import WarmUpButton from '@/components/WarmUpButton';

interface Template {
    id: string;
    name: string;
}

interface Invoice {
    id: string;
    subdomain: string;
    customerName: string;
    subdomainMode: string;
    accessToken: string;
    agreedPrice: number | null;
    templateId: string;
    template: { name: string };
}

interface InvoiceClientProps {
    invoices: Invoice[];
    templates: Template[];
    rootDomain: string;
}

function formatIDR(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
}

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function InvoiceClient({ invoices, templates, rootDomain }: InvoiceClientProps) {
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.agreedPrice || 0), 0);

    // Stats calculations
    const templateCounts = invoices.reduce((acc, inv) => {
        acc[inv.template.name] = (acc[inv.template.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const mostUsedTemplate = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])[0];

    const modeCounts = invoices.reduce((acc, inv) => {
        const mode = inv.subdomainMode === 'BASIC' ? 'Basic' : 'VIP';
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const mostUsedMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const openEditModal = (inv: Invoice) => {
        setEditingInvoice(inv);
        setShowEditModal(true);
        setOpenDropdown(null);
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
        setOpenDropdown(null);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        await deleteInvoice(itemToDelete);
        setIsDeleting(false);
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    return (
        <div className={styles.container}>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                isDeleting={isDeleting}
            />

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Invoice Manager</h1>
                    <p>Manage active client subdomains and assignments</p>
                </div>
                <button className={styles.createButton} onClick={() => setShowModal(true)}>
                    + Create Invoice
                </button>
            </header>

            {/* ... [Stats Row remains same] ... */}
            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{invoices.length}</span>
                    <span className={styles.statLabel}>Active Clients</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValueGreen}>IDR {formatIDR(totalRevenue)}</span>
                    <span className={styles.statLabel}>Total Revenue</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{mostUsedTemplate ? mostUsedTemplate[0] : '-'}</span>
                    <span className={styles.statLabel}>Top Template ({mostUsedTemplate?.[1] || 0})</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{mostUsedMode ? mostUsedMode[0] : '-'}</span>
                    <span className={styles.statLabel}>Top Mode ({mostUsedMode?.[1] || 0})</span>
                </div>
            </div>

            {/* Create Modal - Unchanged */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Invoice</h2>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form
                            action={async (formData) => {
                                await createInvoice(formData);
                                setShowModal(false);
                            }}
                            className={styles.modalForm}
                        >
                            <div className={styles.formGroup}>
                                <label>Customer Name</label>
                                <input name="customerName" placeholder="e.g. John & Jane" required className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Template</label>
                                <select name="templateId" required className={styles.select}>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Subdomain</label>
                                <div className={styles.inputGroup}>
                                    <input name="subdomain" placeholder="john-jane" required pattern="[a-z0-9-]+" className={styles.input} />
                                    <span className={styles.suffix}>.{rootDomain}</span>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Mode</label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input type="radio" name="subdomainMode" value="VIP" defaultChecked />
                                            <span className={styles.radioVip}>VIP</span>
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input type="radio" name="subdomainMode" value="BASIC" />
                                            <span className={styles.radioBasic}>Basic</span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Agreed Price (IDR)</label>
                                    <input type="number" name="agreedPrice" placeholder="500000" className={styles.input} />
                                </div>
                            </div>
                            <button type="submit" className={styles.button}>
                                Create Invoice
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Invoice Modal - Unchanged */}
            {showEditModal && editingInvoice && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Invoice</h2>
                            <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <form
                            action={async (formData) => {
                                await updateInvoice(formData);
                                setShowEditModal(false);
                            }}
                            className={styles.modalForm}
                        >
                            <input type="hidden" name="id" value={editingInvoice.id} />
                            <div className={styles.formGroup}>
                                <label>Customer Name</label>
                                <input name="customerName" defaultValue={editingInvoice.customerName} required className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Template</label>
                                <select name="templateId" defaultValue={editingInvoice.templateId} required className={styles.select}>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Subdomain</label>
                                <div className={styles.inputGroup}>
                                    <input name="subdomain" defaultValue={editingInvoice.subdomain} required pattern="[a-z0-9-]+" className={styles.input} />
                                    <span className={styles.suffix}>.{rootDomain}</span>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Mode</label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input type="radio" name="subdomainMode" value="VIP" defaultChecked={editingInvoice.subdomainMode !== 'BASIC'} />
                                            <span className={styles.radioVip}>VIP</span>
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input type="radio" name="subdomainMode" value="BASIC" defaultChecked={editingInvoice.subdomainMode === 'BASIC'} />
                                            <span className={styles.radioBasic}>Basic</span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Agreed Price (IDR)</label>
                                    <input type="number" name="agreedPrice" defaultValue={editingInvoice.agreedPrice || ''} className={styles.input} />
                                </div>
                            </div>
                            <button type="submit" className={styles.button}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Invoice Table */}
            <section className={styles.listSection}>
                <div className={styles.listHeader}>
                    <h2>Active Invoices</h2>
                    <span className={styles.badge}>{invoices.length} Active</span>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Subdomain</th>
                            <th>Customer</th>
                            <th>Template</th>
                            <th>Mode</th>
                            <th>Price</th>
                            <th>Token</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={7} className={styles.emptyRow}>No active invoices. Create one above!</td></tr>
                        ) : (
                            invoices.map((inv) => {
                                const isVip = inv.subdomainMode !== 'BASIC';
                                const url = isVip
                                    ? `http://${inv.subdomain}.${rootDomain}`
                                    : `http://${rootDomain}/s/${inv.subdomain}`;
                                return (
                                    <tr key={inv.id}>
                                        <td>
                                            <a href={url} target="_blank" className={styles.link}>{inv.subdomain}</a>
                                        </td>
                                        <td>{inv.customerName}</td>
                                        <td>{inv.template.name}</td>
                                        <td>
                                            <span className={isVip ? styles.modeVip : styles.modeBasic}>
                                                {isVip ? 'VIP' : 'Basic'}
                                            </span>
                                        </td>
                                        <td>
                                            {inv.agreedPrice ? (
                                                <span className={styles.price}>IDR {formatIDR(inv.agreedPrice)}</span>
                                            ) : (
                                                <span className={styles.noPrice}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <code className={styles.token}>{inv.accessToken}</code>
                                        </td>
                                        <td>
                                            <div className={styles.actionsCell}>
                                                <WarmUpButton subdomain={inv.subdomain} />
                                                <div className={styles.dropdownWrapper} ref={openDropdown === inv.id ? dropdownRef : null}>
                                                    <button
                                                        className={styles.dropdownTrigger}
                                                        onClick={(e) => toggleDropdown(inv.id, e)}
                                                    >
                                                        ⋮
                                                    </button>
                                                    {openDropdown === inv.id && (
                                                        <div className={styles.dropdownMenu}>
                                                            <a href={`/dashboard/invoices/${inv.id}/edit`} className={styles.dropdownItem}>
                                                                ✏️ Edit Template
                                                            </a>
                                                            <a
                                                                href={url + '/rsvp?token=' + inv.accessToken}
                                                                target="_blank"
                                                                className={styles.dropdownItem}
                                                            >
                                                                📋 View RSVPs
                                                            </a>
                                                            <button
                                                                className={styles.dropdownItem}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(inv);
                                                                }}
                                                            >
                                                                📝 Edit Invoice
                                                            </button>
                                                            <form action={async () => {
                                                                await updateInvoiceMode(inv.id, isVip ? 'BASIC' : 'VIP');
                                                                setOpenDropdown(null);
                                                            }}>
                                                                <button type="submit" className={styles.dropdownItem}>
                                                                    🔄 Switch to {isVip ? 'Basic' : 'VIP'}
                                                                </button>
                                                            </form>
                                                            <form action={async () => {
                                                                await toggleInvoiceStatus(inv.id, 'ARCHIVED');
                                                                setOpenDropdown(null);
                                                            }}>
                                                                <button type="submit" className={styles.dropdownItem}>
                                                                    📦 Archive
                                                                </button>
                                                            </form>
                                                            <button
                                                                className={styles.dropdownItemDanger}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    confirmDelete(inv.id);
                                                                }}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
