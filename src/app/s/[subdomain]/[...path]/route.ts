
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { VirtualFile } from '@/types/virtual-file';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string; path: string[] }> }
) {
    const { subdomain, path } = await params;
    const filePath = path.join('/');

    try {
        const invoice = await db.invoice.findUnique({
            where: { subdomain },
            include: { template: true }
        });

        if (!invoice) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // 1. Try invoice VFS
        let contentSource = invoice.templateContent;
        // 2. Fallback to template VFS
        if (!contentSource || contentSource === '{}') {
            contentSource = invoice.template.content;
        }

        if (!contentSource) {
            return new NextResponse('Not Found', { status: 404 });
        }

        let files: VirtualFile[] = [];
        try {
            files = JSON.parse(contentSource);
        } catch (e) {
            return new NextResponse('Server Error', { status: 500 });
        }

        const findFile = (nodes: VirtualFile[], targetPath: string[]): VirtualFile | null => {
            let currentNodes = nodes;

            for (let i = 0; i < targetPath.length; i++) {
                const segment = decodeURIComponent(targetPath[i]).toLowerCase(); // URL decode + Case insensitive

                // Find node matching segment name (case insensitive)
                const node = currentNodes.find(n => n.name.toLowerCase() === segment);

                if (!node) return null;

                if (i === targetPath.length - 1) {
                    // Last segment, must be file (or should we allow serving folder index? No)
                    if (node.type === 'file') return node;
                    return null;
                } else {
                    // Must be folder to continue
                    if (node.type !== 'folder' || !node.children) return null;
                    currentNodes = node.children;
                }
            }
            return null;
        };

        // Wait, standard file lookup in VFS is usually by name if flattened, but we have a tree.
        // We must respect the tree structure.
        let file = findFile(files, path);

        // Fallback: If not found, and there is a single root folder (common with Template ID wrapping), try inside it.
        if (!file && files.length === 1 && files[0].type === 'folder' && files[0].children) {
            file = findFile(files[0].children, path);
        }

        if (!file || !file.content) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Determine Content-Type
        let contentType = 'text/plain';
        if (file.name.endsWith('.css')) contentType = 'text/css';
        else if (file.name.endsWith('.js')) contentType = 'application/javascript';
        else if (file.name.endsWith('.json')) contentType = 'application/json';
        else if (file.name.endsWith('.html')) contentType = 'text/html';
        else if (file.name.endsWith('.png')) contentType = 'image/png';
        else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (file.name.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (file.name.endsWith('.webp')) contentType = 'image/webp';
        else if (file.name.endsWith('.avif')) contentType = 'image/avif';
        else if (file.name.endsWith('.mp4')) contentType = 'video/mp4';

        // Check if content is a URL (for uploaded media)
        // Note: We check for /uploads or /api or http, NOT just /
        // because CSS files with comments /* */ also start with /
        const isUrl = file.content.startsWith('http') ||
            file.content.startsWith('/uploads') ||
            file.content.startsWith('/api');

        if (isUrl) {
            // For uploaded files, we can redirect to the public URL
            // e.g. /uploads/template/images/foo.jpg
            return NextResponse.redirect(new URL(file.content, request.url));
        }

        return new NextResponse(file.content, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=60' // Cache for 1 min for dev
            }
        });

    } catch (e) {
        console.error("Asset serving error:", e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
