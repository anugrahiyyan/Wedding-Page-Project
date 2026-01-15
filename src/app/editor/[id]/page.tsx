
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import Editor from '@/app/dashboard/templates/editor';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const template = await db.template.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!template) {
        notFound();
    }

    // Ensure we pass the raw content (JSON) if it exists, along with legacy htmlContent
    // The Editor component needs the whole template object to initialize files
    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
            <Editor template={template} />
        </div>
    );
}
