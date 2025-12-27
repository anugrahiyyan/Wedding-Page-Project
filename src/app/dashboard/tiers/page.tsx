import db from '@/lib/db';
import TiersClient from './TiersClient';

export const dynamic = 'force-dynamic';

export default async function TiersPage() {
    const tiers = await db.tier.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
            _count: {
                select: { templates: true }
            }
        }
    });

    return <TiersClient tiers={tiers} />;
}
