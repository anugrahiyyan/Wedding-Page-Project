import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import InvoiceEditor from './editor';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const invoice = await db.invoice.findUnique({
        where: { id: resolvedParams.id },
        include: { template: true },
    });

    if (!invoice) {
        notFound();
    }

    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

    return <InvoiceEditor invoice={invoice} rootDomain={rootDomain} />;
}
