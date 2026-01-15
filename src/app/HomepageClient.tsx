'use client';

import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import TemplateCatalog from '@/components/home/TemplateCatalog';
import Footer from '@/components/layout/Footer';
import { Template } from '@/types';
import { ThemeProvider } from '@/components/theme-provider';

interface HomepageClientProps {
    templates: Template[];
}

export default function HomepageClient({ templates }: HomepageClientProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="home-theme">
            <main className="overflow-x-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
                <Header />
                <Hero />
                <Features />
                <div id="templates">
                    <TemplateCatalog templates={templates} />
                </div>
                <Footer />
            </main>
        </ThemeProvider>
    );
}
