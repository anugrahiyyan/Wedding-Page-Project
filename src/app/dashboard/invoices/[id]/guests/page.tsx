
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import GuestManager from './GuestManager';
import { getGuests } from '@/app/lib/guest-actions';

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const invoice = await db.invoice.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!invoice) {
        notFound();
    }

    const guests = await getGuests(invoice.id);
    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

    return (
        <GuestManager
            invoiceId={invoice.id}
            guests={guests}
            subdomain={invoice.subdomain}
            subdomainMode={invoice.subdomainMode}
            rootDomain={rootDomain}
        />
    );
}
