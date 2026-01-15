'use server';

import db from '@/lib/db';
import { VirtualFile } from '@/types/virtual-file';
import { revalidatePath } from 'next/cache';

// Helper to ensure initial structure exists
const DEFAULT_FILES: VirtualFile[] = [
    {
        id: 'root-index',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Wedding</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome</h1>
    <script src="script.js"></script>
</body>
</html>`
    },
    {
        id: 'root-style',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `body {
    background: #f0f0f0;
    font-family: sans-serif;
}`
    },
    {
        id: 'root-script',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `console.log('Hello world');`
    }
];

export async function getTemplateFiles(templateId: string): Promise<VirtualFile[]> {
    try {
        const template = await db.template.findUnique({
            where: { id: templateId },
            select: { content: true } // We store the JSON file tree here
        });

        if (!template || !template.content || template.content === '{}') {
            return DEFAULT_FILES;
        }

        try {
            const files = JSON.parse(template.content);
            if (Array.isArray(files)) {
                return files as VirtualFile[];
            }
            return DEFAULT_FILES;
        } catch (e) {
            console.error("Error parsing template files:", e);
            return DEFAULT_FILES;
        }
    } catch (error) {
        console.error("Database error fetching files:", error);
        return DEFAULT_FILES;
    }
}

export async function saveTemplateFiles(templateId: string, files: VirtualFile[], thumbnail?: string) {
    try {
        const jsonContent = JSON.stringify(files);
        const mainHtml = findMainHtml(files);

        const updateData: any = {
            content: jsonContent,
            htmlContent: mainHtml
        };

        if (thumbnail !== undefined) {
            updateData.thumbnail = thumbnail;
        }

        await db.template.update({
            where: { id: templateId },
            data: updateData
        });

        revalidatePath(`/dashboard/templates/${templateId}`);
        revalidatePath(`/preview/${templateId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save template files:", error);
        return { success: false, error: 'Failed to save' };
    }
}

export async function getInvoiceFiles(invoiceId: string): Promise<VirtualFile[]> {
    try {
        const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: { template: true }
        });

        if (!invoice) return DEFAULT_FILES;

        // 1. Prefer existing invoice content
        if (invoice.templateContent && invoice.templateContent !== '{}') {
            try {
                const files = JSON.parse(invoice.templateContent);
                if (Array.isArray(files)) return files as VirtualFile[];
            } catch (e) {
                console.error("Error parsing invoice files:", e);
            }
        }

        // 2. Fallback to template content
        if (invoice.template && invoice.template.content && invoice.template.content !== '{}') {
            try {
                const files = JSON.parse(invoice.template.content);
                if (Array.isArray(files)) return files as VirtualFile[];
            } catch (e) {
                console.error("Error parsing original template files:", e);
            }
        }

        return DEFAULT_FILES;
    } catch (error) {
        console.error("Database error fetching invoice files:", error);
        return DEFAULT_FILES;
    }
}

export async function saveInvoiceFiles(invoiceId: string, files: VirtualFile[], thumbnail?: string) {
    try {
        const jsonContent = JSON.stringify(files);
        const mainHtml = findMainHtml(files);

        await db.invoice.update({
            where: { id: invoiceId },
            data: {
                templateContent: jsonContent,
                htmlContent: mainHtml
                // We typically don't update thumbnail on invoice, but we could if needed. 
                // For now, ignoring thumbnail arg for invoices as they usually use the template's thumb or a generated snapshot which is handled differently.
            }
        });

        revalidatePath(`/dashboard/invoices/${invoiceId}/edit`);
        // We might want to revalidate the public view too
        // revalidatePath(`/s/...`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save invoice files:", error);
        return { success: false, error: 'Failed to save' };
    }
}

// Helper to find index.html content
function findMainHtml(nodes: VirtualFile[]): string | null {
    for (const node of nodes) {
        if (node.type === 'file' && node.name === 'index.html') {
            return node.content || '';
        }
        if (node.type === 'folder' && node.children) {
            const found = findMainHtml(node.children);
            if (found) return found;
        }
    }
    return null;
}
