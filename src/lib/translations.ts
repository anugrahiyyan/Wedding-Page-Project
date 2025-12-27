// Translations for Undangan Rabiku Homepage
export type Language = 'id' | 'en';

export const translations = {
    id: {
        // Header
        brandName: 'Undangan Rabiku',
        contactUs: 'Hubungi Kami',

        // Hero
        heroTitle: 'Buat Undangan Pernikahan Impianmu',
        heroSubtitle: 'Temukan koleksi template undangan digital yang cantik, responsif, dan mudah dikustomisasi.',

        // Gallery/Templates
        galleryTitle: 'Pilih Template Undanganmu',
        viewTemplate: 'Lihat Template',
        buyTemplate: 'Pesan Sekarang!',
        noTemplates: 'Belum ada template tersedia. Admin perlu membuat template terlebih dahulu!',

        // Tier sections
        starterPackages: 'Paket Starter',
        standardPackages: 'Paket Standar',
        premiumPackages: 'Paket Premium',
        otherPackages: 'Paket Lainnya',

        // Footer
        copyright: '© 2025 Undangan Rabiku. Hak cipta dilindungi.',

        // Language
        language: 'Bahasa',
    },
    en: {
        // Header
        brandName: 'Undangan Rabiku',
        contactUs: 'Contact Us',

        // Hero
        heroTitle: 'Create Your Dream Wedding Invitation',
        heroSubtitle: 'Discover our collection of beautiful, responsive, and customizable digital wedding invitations.',

        // Gallery/Templates
        galleryTitle: 'Choose Your Template',
        viewTemplate: 'View Template',
        buyTemplate: 'Order Now!',
        noTemplates: 'No templates available yet. Admin needs to create one!',

        // Tier sections
        starterPackages: 'Starter Packages',
        standardPackages: 'Standard Packages',
        premiumPackages: 'Premium Packages',
        otherPackages: 'Other Packages',

        // Footer
        copyright: '© 2025 Undangan Rabiku. All rights reserved.',

        // Language
        language: 'Language',
    }
} as const;

export function getTranslations(lang: Language) {
    return translations[lang];
}
