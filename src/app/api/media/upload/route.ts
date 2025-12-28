import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // 2. File Type Validation (MIME)
        const validMimeTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm'
        ];
        if (!validMimeTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 });
        }

        // 3. Double Extension & RCE Prevention
        // We fundamentally prevent this by NOT using the user's filename structure.
        // We verify the extension against the whitelist and generate a completely new name.
        const originalName = file.name.toLowerCase();

        // Check for suspicious patterns like multiple dots (often used in double extension attacks)
        // Although we rename the file, rejecting these gives immediate feedback on security policy.
        if ((originalName.match(/\./g) || []).length > 1) {
            return NextResponse.json({ success: false, error: 'Security Violation: Double extensions are not allowed.' }, { status: 400 });
        }

        // Extract and validate extension
        const ext = originalName.split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'];

        if (!ext || !allowedExtensions.includes(ext)) {
            return NextResponse.json({ success: false, error: 'Invalid file extension.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate Safe Filename: Timestamp-Random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = `${uniqueSuffix}.${ext}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, finalFilename);
        await writeFile(path, buffer);

        const url = `/uploads/${finalFilename}`;

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
