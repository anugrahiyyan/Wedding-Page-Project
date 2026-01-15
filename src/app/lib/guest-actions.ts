'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Helper to sanitize name for slug
const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '') || 'guest'; // specific fallback
};

export async function addGuest(invoiceId: string, name: string, phone?: string) {
    try {
        let slug = generateSlug(name);

        // Ensure uniqueness
        const existing = await db.guest.findFirst({
            where: { invoiceId, slug }
        });

        if (existing) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        const guest = await db.guest.create({
            data: {
                invoiceId,
                name,
                slug,
                phone
            }
        });

        revalidatePath(`/dashboard/invoices/${invoiceId}/guests`);
        return { success: true, guest };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed to add guest' };
    }
}

export async function bulkAddGuests(invoiceId: string, guestsData: { name: string, phone?: string }[]) {
    try {
        let count = 0;
        for (const g of guestsData) {
            await addGuest(invoiceId, g.name, g.phone);
            count++;
        }
        revalidatePath(`/dashboard/invoices/${invoiceId}/guests`);
        return { success: true, count };
    } catch (e) {
        return { success: false, error: 'Failed' };
    }
}

export async function deleteGuest(guestId: string, invoiceId: string) {
    try {
        await db.guest.delete({ where: { id: guestId } });
        revalidatePath(`/dashboard/invoices/${invoiceId}/guests`);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed' };
    }
}

export async function getGuests(invoiceId: string) {
    return await db.guest.findMany({
        where: { invoiceId },
        orderBy: { createdAt: 'desc' }
    });
}

// For public access
export async function getGuestBySlug(invoiceId: string, slug: string) {
    return await db.guest.findFirst({
        where: { invoiceId, slug }
    });
}
