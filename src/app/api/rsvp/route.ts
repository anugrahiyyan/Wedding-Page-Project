import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subdomain, guestName, email, attending, allergies, comment } = body;

        if (!subdomain || !guestName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const invoice = await db.invoice.findUnique({
            where: { subdomain }
        });

        if (!invoice || invoice.status === 'ARCHIVED') {
            return NextResponse.json({ success: false, error: 'Invalid or expired invitation' }, { status: 404 });
        }

        const submission = await db.rsvpSubmission.create({
            data: {
                invoiceId: invoice.id,
                guestName,
                email: email || null,
                attending: attending === true || attending === 'true',
                allergies: allergies || null,
                comment: comment || null,
            }
        });

        revalidatePath(`/s/${subdomain}`);

        return NextResponse.json({ success: true, submission });
    } catch (error) {
        console.error('RSVP API error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
