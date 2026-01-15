'use client';

import { useState } from 'react';
import { addGuest, deleteGuest, bulkAddGuests } from '@/app/lib/guest-actions';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ModernModal';
import { toast } from 'react-hot-toast';

interface GuestStructure {
    id: string;
    invoiceId: string;
    name: string;
    slug: string;
    token: string;
    phone?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function GuestManager({
    invoiceId,
    guests,
    subdomain,
    subdomainMode,
    rootDomain
}: {
    invoiceId: string,
    guests: any[],
    subdomain: string,
    subdomainMode: string,
    rootDomain: string
}) {
    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [mode, setMode] = useState<'single' | 'bulk'>('single');

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await addGuest(invoiceId, name, phone);
        setName('');
        setPhone('');
        setIsSubmitting(false);
        setIsAddModalOpen(false);
        router.refresh();
        toast.success('Guest added successfully');
    };

    const handleBulk = async () => {
        setIsSubmitting(true);
        const lines = bulkText.split('\n').filter(l => l.trim());
        const guestsToAdd = lines.map(l => {
            const parts = l.split(','); // simple name,phone CSV style or just name
            return { name: parts[0].trim(), phone: parts[1]?.trim() };
        });
        await bulkAddGuests(invoiceId, guestsToAdd);
        setBulkText('');
        setIsSubmitting(false);
        setIsAddModalOpen(false);
        router.refresh();
        toast.success(`Imported ${guestsToAdd.length} guests`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove guest?')) return;
        await deleteGuest(id, invoiceId);
        router.refresh();
        toast.success('Guest removed');
    };

    const getLink = (slug: string) => {
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        // Logic:
        // If VIP Mode: http://${subdomain}.${rootDomain}?to=${slug}
        // If Basic Mode: http://${rootDomain}/s/${subdomain}?to=${slug}

        let baseUrl = '';
        // Allow localhost subdomains if VIP mode is set
        if (subdomainMode === 'VIP') {
            baseUrl = `${protocol}//${subdomain}.${rootDomain}`;
        } else {
            // Basic mode
            baseUrl = `${protocol}//${rootDomain}/s/${subdomain}`;
        }

        return `${baseUrl}?to=${slug}`;
    };

    const copyLink = (slug: string) => {
        const url = getLink(slug);
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const shareWhatsapp = (g: any) => {
        const url = getLink(g.slug);
        const text = `Hi ${g.name}, you are invited to our wedding! Open this link: ${url}`;
        window.open(`https://wa.me/${g.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Guest Manager</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <span>+ Add Guest</span>
                </button>
            </div>

            {/* Guest List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="p-4 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Name</th>
                                <th className="p-4 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Slug/ID</th>
                                <th className="p-4 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                                <th className="p-4 border-b dark:border-gray-700 text-right text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {guests.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-gray-500 dark:text-gray-400">No guests added yet. Click "Add Guest" to start.</td></tr>
                            ) : (
                                guests.map((g: any) => (
                                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{g.name}</td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{g.slug}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${g.status === 'RSVP_YES' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                g.status === 'RSVP_NO' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            <button onClick={() => copyLink(g.slug)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">Copy Link</button>
                                            <button onClick={() => shareWhatsapp(g)} className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">WhatsApp</button>
                                            <button onClick={() => handleDelete(g.id)} className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note about WhatsApp */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Pro Tip: Bulk WhatsApp Sending</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    To send invitations in bulk via WhatsApp, we recommend using the <a href="https://business.whatsapp.com/" target="_blank" className="text-blue-600 hover:underline">WhatsApp Business API</a> for official integrations.
                    Alternatively, for smaller lists, you can manually click the "WhatsApp" button above for each guest to open a pre-filled chat.
                    Third-party browser extensions exist but use them with caution as they are not official supported.
                </p>
            </div>

            {/* Add Guest Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Guests"
            >
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setMode('single')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mode === 'single'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Single Add
                        </button>
                        <button
                            onClick={() => setMode('bulk')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mode === 'bulk'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Bulk Add
                        </button>
                    </div>

                    {mode === 'single' ? (
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Name</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Rama & Indah"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number (Optional)</label>
                                <input
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. +628123456789"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Guest'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paste Guest List</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Format: Name, Phone (one per line)</p>
                                <textarea
                                    value={bulkText}
                                    onChange={e => setBulkText(e.target.value)}
                                    className="w-full h-40 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    placeholder="Rama & Indah, +628123456789&#10;Budi Santoso&#10;Siti Aminah, +628555..."
                                    autoFocus
                                ></textarea>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleBulk}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Add All Guests'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
