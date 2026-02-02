import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { checkCsrf } from '@/lib/csrf';

export async function POST(request: NextRequest) {
    // CSRF Protection: Validate origin
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    try {
        const body = await request.json();
        console.log('RSVP Payload received:', body);
        const { subdomain, guestName, email, attending, allergies, comment } = body;

        if (!subdomain || !guestName) {
            console.error('RSVP Error: Missing required fields', { subdomain, guestName });
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const invoice = await db.invoice.findUnique({
            where: { subdomain }
        });

        if (!invoice || invoice.status === 'ARCHIVED') {
            console.error('RSVP Error: Invoice not found or archived', subdomain);
            return NextResponse.json({ success: false, error: 'Invalid or expired invitation' }, { status: 404 });
        }

        // Robust boolean parsing
        const isAttending = attending === true || attending === 'true';

        const submission = await db.rsvpSubmission.create({
            data: {
                invoiceId: invoice.id,
                guestName,
                email: email || null,
                attending: isAttending,
                allergies: allergies || null,
                comment: comment || null,
            }
        });

        console.log('RSVP Submission created successfully:', submission.id);

        // Revalidate both the main page and the RSVP guest list page
        revalidatePath(`/s/${subdomain}`);
        revalidatePath(`/s/${subdomain}/rsvp`);

        return NextResponse.json({ success: true, submission });
    } catch (error) {
        console.error('RSVP API error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
