import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';
import bcryptjs from 'bcryptjs';
import { checkCsrf } from '@/lib/csrf';

export async function POST(request: NextRequest) {
    // CSRF Protection
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    try {
        const session = await auth();
        if (!session?.user?.name) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        // Find user by username (stored in session.user.name)
        const user = await db.user.findUnique({
            where: { username: session.user.name }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const isValid = await bcryptjs.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update password error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
