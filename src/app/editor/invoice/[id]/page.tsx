
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import Editor from '@/app/dashboard/templates/editor';

export default async function InvoiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const invoice = await db.invoice.findUnique({
        where: { id: resolvedParams.id },
        include: { template: true },
    });

    if (!invoice) {
        notFound();
    }

    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
            <Editor
                template={{
                    id: invoice.id,
                    name: invoice.customerName,
                    thumbnail: invoice.template.thumbnail
                }}
                mode="invoice"
                rootDomain={rootDomain}
                subdomain={invoice.subdomain}
            />
        </div>
    );
}
