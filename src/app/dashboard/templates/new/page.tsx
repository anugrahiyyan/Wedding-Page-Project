import db from '@/lib/db';
import { NewTemplateForm } from './NewTemplateForm';



export default async function NewTemplatePage() {
    const tiers = await db.tier.findMany({
        orderBy: { sortOrder: 'asc' },
    });

    return <NewTemplateForm tiers={tiers} />;
}
