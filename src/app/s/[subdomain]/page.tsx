import db from '@/lib/db';
import { notFound } from 'next/navigation';
import TemplateRenderer from '@/components/TemplateRenderer';

import { Metadata } from 'next';



export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const resolvedParams = await params;

    // Fetch data for metadata
    const invoice = await db.invoice.findUnique({
        where: { subdomain: resolvedParams.subdomain },
        select: {
            customerName: true,
            templateContent: true,
            template: { select: { content: true } }
        }
    });

    if (!invoice) {
        return {
            title: 'Wedding Invitation Not Found',
        };
    }

    let favicon = '/favicon.ico';
    try {
        const contentSource = invoice.templateContent || invoice.template?.content;
        if (contentSource) {
            const content = JSON.parse(contentSource);
            if (content.favicon) {
                favicon = content.favicon;
            }
        }
    } catch (e) {
        // Ignore parsing errors for metadata
    }

    return {
        title: `The Wedding of ${invoice.customerName}`,
        description: `Join us in celebrating the wedding of ${invoice.customerName}`,
        icons: {
            icon: favicon,
        }
    };
}

export default async function SubdomainPage({ params }: { params: Promise<{ subdomain: string }> }) {
    const resolvedParams = await params;
    const invoice = await db.invoice.findUnique({
        where: { subdomain: resolvedParams.subdomain },
        include: {
            template: true,
            rsvpSubmissions: {
                where: { comment: { not: null } },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { guestName: true, comment: true, createdAt: true }
            }
        },
    });

    // Block access if invoice doesn't exist, has no template, or is ARCHIVED
    if (!invoice || !invoice.template || invoice.status === 'ARCHIVED') {
        notFound();
    }

    // Use custom invoice HTML if available, otherwise fall back to template
    const htmlContent = invoice.htmlContent || invoice.template.htmlContent;
    let content = {};
    try {
        const contentSource = invoice.templateContent || invoice.template.content;
        if (contentSource) content = JSON.parse(contentSource);
    } catch (e) {
        content = {};
    }

    // Map wishes for client component
    const initialWishes = invoice.rsvpSubmissions.map((s: any) => ({
        guestName: s.guestName,
        comment: s.comment,
        createdAt: s.createdAt
    }));

    return (
        <TemplateRenderer
            content={content}
            htmlContent={htmlContent}
            subdomain={resolvedParams.subdomain}
            initialWishes={initialWishes}
        />
    );
}

