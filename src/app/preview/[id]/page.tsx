import db from '@/lib/db';
import { notFound } from 'next/navigation';
import TemplateRenderer from '@/components/TemplateRenderer';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const template = await db.template.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!template) {
        notFound();
    }

    // Handle potentially invalid JSON content
    let content;
    try {
        content = JSON.parse(template.content);
    } catch (e) {
        content = {};
    }

    return (
        <TemplateRenderer content={content} showCheckout={true} templateName={template.name} />
    );
}
