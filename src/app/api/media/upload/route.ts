import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';
import { checkCsrf } from '@/lib/csrf';

// Expanded supported formats
const VALID_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff',
    'image/avif'
];

const VALID_VIDEO_TYPES = [
    'video/mp4', 'video/webm', 'video/quicktime', // mov
    'video/x-msvideo', // avi
    'video/x-matroska', // mkv
    'video/mp2t', // ts
    'video/mpeg' // mpg
];

const ALLOWED_EXTENSIONS = [
    // Images
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'tif', 'avif',
    // Videos
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'ts', 'mpg', 'mpeg'
];

export async function POST(request: NextRequest) {
    // CSRF Protection
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    try {
        // 1. Authentication Check
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('file') as File[];
        const templateId = formData.get('templateId') as string | null;

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
        }

        // Process all files (bulk upload support)
        const results: { url: string; name: string; type: string }[] = [];
        const errors: string[] = [];

        for (const file of files) {
            // 2. File Type Validation (MIME)
            const isImage = VALID_IMAGE_TYPES.includes(file.type);
            const isVideo = VALID_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isVideo) {
                errors.push(`${file.name}: Unsupported format (${file.type})`);
                continue;
            }

            // 3. Extension validation
            const originalName = file.name.toLowerCase();
            const ext = originalName.split('.').pop();

            if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
                errors.push(`${file.name}: Invalid extension`);
                continue;
            }

            // 4. Double extension check (security)
            if ((originalName.match(/\./g) || []).length > 1) {
                errors.push(`${file.name}: Double extensions not allowed`);
                continue;
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate Safe Filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const finalFilename = `${uniqueSuffix}.${ext}`;

            // Determine upload directory: uploads/[templateId]/[images|videos]
            let uploadSubPath = 'uploads';
            if (templateId && /^[a-zA-Z0-9_-]+$/.test(templateId)) {
                uploadSubPath = `uploads/${templateId}/${isImage ? 'images' : 'videos'}`;
            }

            const uploadDir = join(process.cwd(), 'public', uploadSubPath);
            await mkdir(uploadDir, { recursive: true });

            const path = join(uploadDir, finalFilename);
            await writeFile(path, buffer);

            const url = `/${uploadSubPath}/${finalFilename}`;
            results.push({
                url,
                name: file.name,
                type: isImage ? 'image' : 'video'
            });
        }

        if (results.length === 0 && errors.length > 0) {
            return NextResponse.json({
                success: false,
                error: errors.join('; ')
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            uploads: results,
            url: results[0]?.url, // Backward compatible
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
