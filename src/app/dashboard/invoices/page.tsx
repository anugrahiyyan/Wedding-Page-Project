import db from '@/lib/db';
import InvoiceClient from './InvoiceClient';



export default async function InvoicesPage() {
    const invoices = await db.invoice.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: { template: { select: { name: true } } }
    });

    const templates = await db.template.findMany({
        select: { id: true, name: true }
    });

    const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

    // Serialize for client
    const serializedInvoices = invoices.map((inv: any) => ({
        id: inv.id,
        subdomain: inv.subdomain,
        customerName: inv.customerName,
        subdomainMode: inv.subdomainMode,
        accessToken: inv.accessToken,
        agreedPrice: inv.agreedPrice,
        templateId: inv.templateId,
        template: { name: inv.template.name }
    }));

    return (
        <InvoiceClient
            invoices={serializedInvoices}
            templates={templates}
            rootDomain={rootDomain}
        />
    );
}
