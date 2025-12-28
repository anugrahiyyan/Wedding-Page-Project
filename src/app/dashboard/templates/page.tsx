import db from '@/lib/db';
import TemplatesClient from './TemplatesClient';



export default async function DashboardPage() {
    const templates = await db.template.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return <TemplatesClient templates={templates} />;
}
