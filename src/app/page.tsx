import Link from 'next/link';
import db from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const templates = await db.template.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>WeddingAdmin</div>
        <nav className={styles.nav}>
          <a href="https://wa.me/6281230826731?text=Hi,%20I%20want%20to%20buy%20a%20wedding%20template" target="_blank" className={styles.checkoutButton}>
            Contact Us!
          </a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Create Your Dream Wedding Page</h1>
          <p className={styles.heroSubtitle}>
            Browse our collection of beautiful, responsive wedding templates.
          </p>
        </section>

        <section className={styles.gallery}>
          <h2 className={styles.galleryTitle}>Choose Your Wedding Invitation Templates</h2>
          <div className={styles.grid}>
            {templates.length === 0 ? (
              <p className={styles.emptyState}>No templates available yet. Admin needs to create one!</p>
            ) : (
              templates.map((template) => (
                <div key={template.id} className={styles.card}>
                  <div className={styles.cardPreview}>
                    {template.thumbnail ? (
                      <img src={template.thumbnail} alt={template.name} className={styles.cardImage} />
                    ) : (
                      <span>💒</span>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{template.name}</h3>
                    <Link href={`/preview/${template.id}`} className={styles.button}>
                      View Template
                    </Link>
                    <a
                      href={`https://wa.me/6281230826731?text=Hi,%20I%20want%20to%20buy%20template:%20${encodeURIComponent(template.name)}`}
                      target="_blank"
                      className={styles.checkoutCardBtn}
                    >
                      I want this!
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 WeddingAdmin. All rights reserved.</p>
      </footer>
    </div >
  );
}
