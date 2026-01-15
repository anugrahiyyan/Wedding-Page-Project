
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { VirtualFile } from '@/types/virtual-file';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string; path: string[] }> }
) {
    const { id, path } = await context.params;

    if (!id || !path || path.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    try {
        const template = await db.template.findUnique({
            where: { id },
            select: { content: true }
        });

        if (!template || !template.content) {
            return new NextResponse('Template Not Found', { status: 404 });
        }

        // Parse content - could be empty '{}' or actual VFS array
        let files: VirtualFile[] = [];
        try {
            const parsed = JSON.parse(template.content);
            if (Array.isArray(parsed)) {
                files = parsed;
            } else {
                // Legacy/empty content - return 404 for assets
                console.log('[Asset Proxy] Template has no VFS files. Content:', template.content.substring(0, 50));
                return new NextResponse('Project not initialized. Please save in the Editor first.', { status: 404 });
            }
        } catch (e) {
            return new NextResponse('Invalid project data', { status: 500 });
        }

        const requestedPath = path.join('/');

        // Helper to find file in tree
        const findFile = (nodes: VirtualFile[], currentPath: string): VirtualFile | null => {
            for (const node of nodes) {
                if (node.type === 'file' && currentPath === node.name) {
                    return node;
                }
                if (node.type === 'folder' && currentPath.startsWith(node.name + '/')) {
                    const remainingPath = currentPath.substring(node.name.length + 1);
                    const found = findFile(node.children || [], remainingPath);
                    if (found) return found;
                }
            }
            return null;
        };

        let file = findFile(files, requestedPath);

        // Fallback: If not found, and there is a single root folder (common with Template ID wrapping), try inside it.
        if (!file && files.length === 1 && files[0].type === 'folder' && files[0].children) {
            file = findFile(files[0].children, requestedPath);
        }

        if (!file) {
            console.log(`[Asset Proxy] File not found: ${requestedPath} in template ${id}`);
            return new NextResponse(`File not found: ${requestedPath}`, { status: 404 });
        }

        // Determine Content-Type
        let contentType = 'text/plain';
        if (file.name.endsWith('.css')) contentType = 'text/css';
        else if (file.name.endsWith('.js')) contentType = 'application/javascript';
        else if (file.name.endsWith('.json')) contentType = 'application/json';
        else if (file.name.endsWith('.html')) contentType = 'text/html';

        return new NextResponse(file.content || '', {
            headers: { 'Content-Type': contentType }
        });

    } catch (error) {
        console.error('Asset serving error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
