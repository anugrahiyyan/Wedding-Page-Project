import db from '@/lib/db';
import { notFound } from 'next/navigation';
import UserEditor from './user-editor';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const user = await db.user.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!user) {
        notFound();
    }

    return <UserEditor user={user} />;
}
