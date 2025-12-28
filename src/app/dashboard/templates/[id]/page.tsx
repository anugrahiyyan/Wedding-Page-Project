import db from '@/lib/db';
import Editor from '../editor';
import { notFound } from 'next/navigation';



export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const template = await db.template.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!template) {
        notFound();
    }

    return <Editor template={template} />;
}
