import db from '@/lib/db';
import HomepageClient from './HomepageClient';



export default async function LandingPage() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tier: true,
    }
  });

  // Serialize for client component
  const serializedTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    thumbnail: t.thumbnail,
    price: t.price,
    tier: t.tier ? {
      id: t.tier.id,
      name: t.tier.name,
      priceMin: t.tier.priceMin,
      priceMax: t.tier.priceMax,
      color: t.tier.color,
    } : null,
  }));

  return <HomepageClient templates={serializedTemplates} />;
}
