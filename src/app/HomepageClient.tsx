'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Language, getTranslations } from '@/lib/translations';

interface Tier {
    id: string;
    name: string;
    priceMin: number;
    priceMax: number;
    color: string;
}

interface Template {
    id: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    price: number | null;
    tier: Tier | null;
}

interface HomepageClientProps {
    templates: Template[];
}

function formatIDR(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} jt`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
}

// Get tier color - use tier's custom color or fallback to default
function getTierColor(tier: Tier | null): string {
    if (!tier) return '#646cff';
    return tier.color || '#646cff';
}

function getTierSectionName(tierName: string | undefined, t: ReturnType<typeof getTranslations>): string {
    if (!tierName) return t.otherPackages;
    const lower = tierName.toLowerCase();
    if (lower.includes('starter') || lower.includes('basic')) return t.starterPackages;
    if (lower.includes('standard') || lower.includes('mid')) return t.standardPackages;
    if (lower.includes('premium') || lower.includes('pro')) return t.premiumPackages;
    return t.otherPackages;
}

export default function HomepageClient({ templates }: HomepageClientProps) {
    const [lang, setLang] = useState<Language>('id');
    const t = getTranslations(lang);

    useEffect(() => {
        const saved = localStorage.getItem('rabiku-lang') as Language;
        if (saved) setLang(saved);
    }, []);

    const toggleLang = () => {
        const newLang = lang === 'id' ? 'en' : 'id';
        setLang(newLang);
        localStorage.setItem('rabiku-lang', newLang);
    };

    // Group templates by tier
    const groupedTemplates = templates.reduce((acc, template) => {
        const tierName = template.tier?.name || 'Other';
        if (!acc[tierName]) acc[tierName] = [];
        acc[tierName].push(template);
        return acc;
    }, {} as Record<string, Template[]>);

    // Sort tiers by priority
    const tierOrder = ['Starter', 'Standard', 'Premium'];
    const sortedTierNames = Object.keys(groupedTemplates).sort((a, b) => {
        const aIndex = tierOrder.findIndex(t => a.toLowerCase().includes(t.toLowerCase()));
        const bIndex = tierOrder.findIndex(t => b.toLowerCase().includes(t.toLowerCase()));
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>{t.brandName}</div>
                <nav className={styles.nav}>
                    <button onClick={toggleLang} className={styles.langToggle}>
                        🌐 {lang.toUpperCase()}
                    </button>
                    <a
                        href="https://wa.me/6281230826731?text=Hi,%20saya%20ingin%20pesan%20undangan%20digital"
                        target="_blank"
                        className={styles.checkoutButton}
                    >
                        {t.contactUs}
                    </a>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
                    <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
                </section>

                <section className={styles.gallery}>
                    <h2 className={styles.galleryTitle}>{t.galleryTitle}</h2>

                    {templates.length === 0 ? (
                        <p className={styles.emptyState}>{t.noTemplates}</p>
                    ) : (
                        sortedTierNames.map((tierName) => (
                            <div key={tierName} className={styles.tierSection}>
                                <h3 className={styles.tierSectionTitle}>
                                    <span
                                        className={styles.tierBadgeLarge}
                                        style={{ background: getTierColor(groupedTemplates[tierName][0]?.tier) }}
                                    >
                                        {getTierSectionName(tierName, t)}
                                    </span>
                                </h3>
                                <div className={styles.grid}>
                                    {groupedTemplates[tierName].map((template) => (
                                        <div key={template.id} className={styles.card}>
                                            <div className={styles.cardPreview}>
                                                {template.thumbnail ? (
                                                    <img src={template.thumbnail} alt={template.name} className={styles.cardImage} />
                                                ) : (
                                                    <span>💒</span>
                                                )}
                                            </div>
                                            <div className={styles.cardContent}>
                                                <div className={styles.cardMeta}>
                                                    {template.tier && (
                                                        <span
                                                            className={styles.tierBadge}
                                                            style={{ background: getTierColor(template.tier) }}
                                                        >
                                                            {template.tier.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={styles.cardTitle}>{template.name}</h3>
                                                {template.price && (
                                                    <p className={styles.cardPrice}>IDR {formatIDR(template.price)}</p>
                                                )}
                                                {!template.price && template.tier && (
                                                    <p className={styles.cardPrice}>
                                                        IDR {formatIDR(template.tier.priceMin)} - {formatIDR(template.tier.priceMax)}
                                                    </p>
                                                )}
                                                {template.description && (
                                                    <p className={styles.cardDescription}>{template.description}</p>
                                                )}
                                                <div className={styles.cardActions}>
                                                    <Link href={`/preview/${template.id}`} className={styles.button}>
                                                        {t.viewTemplate}
                                                    </Link>
                                                    <a
                                                        href={`https://wa.me/6281230826731?text=Hi,%20saya%20ingin%20pesan%20template:%20${encodeURIComponent(template.name)}`}
                                                        target="_blank"
                                                        className={styles.checkoutCardBtn}
                                                    >
                                                        {t.buyTemplate}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            <footer className={styles.footer}>
                <p>{t.copyright}</p>
            </footer>
        </div>
    );
}
