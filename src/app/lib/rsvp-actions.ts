'use server'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const RsvpSchema = z.object({
    guestName: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    attending: z.boolean(),
    allergies: z.string().optional(),
    comment: z.string().optional(),
})

export async function submitRsvp(subdomain: string, formData: FormData): Promise<{ success: boolean; error?: string; submission?: any }> {
    const invoice = await db.invoice.findUnique({
        where: { subdomain }
    });

    if (!invoice || invoice.status === 'ARCHIVED') {
        return { success: false, error: 'Invalid or expired invitation' };
    }

    const validated = RsvpSchema.safeParse({
        guestName: formData.get('guestName'),
        email: formData.get('email') || '',
        attending: formData.get('attending') === 'true',
        allergies: formData.get('allergies') || '',
        comment: formData.get('comment') || '',
    });

    if (!validated.success) {
        return { success: false, error: 'Invalid form data' };
    }

    try {
        const submission = await db.rsvpSubmission.create({
            data: {
                invoiceId: invoice.id,
                guestName: validated.data.guestName,
                email: validated.data.email || null,
                attending: validated.data.attending,
                allergies: validated.data.allergies || null,
                comment: validated.data.comment || null,
            }
        });
        revalidatePath(`/s/${subdomain}`);
        return { success: true, submission };
    } catch (error) {
        console.error('Failed to submit RSVP:', error);
        return { success: false, error: 'Failed to save RSVP' };
    }
}

export async function getRecentWishes(subdomain: string) {
    const invoice = await db.invoice.findUnique({
        where: { subdomain },
        include: {
            rsvpSubmissions: {
                where: { comment: { not: null } },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { guestName: true, comment: true, createdAt: true }
            }
        }
    });

    if (!invoice) return [];
    return invoice.rsvpSubmissions;
}

export async function getRsvpSubmissions(subdomain: string, token: string) {
    const invoice = await db.invoice.findUnique({
        where: { subdomain },
        include: { rsvpSubmissions: { orderBy: { createdAt: 'desc' } } }
    });

    if (!invoice) {
        return { success: false, error: 'Invoice not found', data: [] };
    }

    if (invoice.accessToken !== token) {
        return { success: false, error: 'Invalid access token', data: [] };
    }

    return { success: true, data: invoice.rsvpSubmissions };
}

