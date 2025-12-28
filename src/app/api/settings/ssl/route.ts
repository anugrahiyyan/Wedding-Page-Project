import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const pemFile = formData.get('pem') as File | null;
        const keyFile = formData.get('key') as File | null;

        if (!pemFile || !keyFile) {
            return NextResponse.json(
                { success: false, error: 'Both .pem and .key files are required' },
                { status: 400 }
            );
        }

        const sslDir = path.join(process.cwd(), 'ssl');

        // Ensure ssl directory exists
        try {
            await mkdir(sslDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Save PEM file
        const pemBuffer = Buffer.from(await pemFile.arrayBuffer());
        await writeFile(path.join(sslDir, 'server.pem'), pemBuffer);

        // Save Key file
        const keyBuffer = Buffer.from(await keyFile.arrayBuffer());
        await writeFile(path.join(sslDir, 'server.key'), keyBuffer);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('SSL Upload Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save SSL files' },
            { status: 500 }
        );
    }
}
