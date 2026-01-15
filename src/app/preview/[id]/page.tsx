import db from '@/lib/db';
import { notFound } from 'next/navigation';
import TemplateRenderer from '@/components/TemplateRenderer';
import { VirtualFile } from '@/types/virtual-file';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const template = await db.template.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!template) {
        notFound();
    }

    // Try to find index.html in the virtual file system
    let htmlContent = template.htmlContent || '';
    let content = {};

    try {
        if (template.content && template.content !== '{}') {
            const files = JSON.parse(template.content) as VirtualFile[];
            content = files;

            // Recursive finder for index.html
            const findIndex = (nodes: VirtualFile[]): string | null => {
                for (const node of nodes) {
                    if (node.type === 'file' && node.name === 'index.html') {
                        return node.content || '';
                    }
                    if (node.children) {
                        const found = findIndex(node.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const indexHtml = findIndex(files);
            if (indexHtml) {
                htmlContent = indexHtml;
            }
        } else {
            content = JSON.parse(template.content || '{}');
        }
    } catch (e) {
        console.error("Error parsing template content for preview:", e);
    }

    // CRITICAL: Inject <base> tag to fix relative URL resolution for assets
    // This ensures style.css resolves to /preview/[id]/style.css, not /preview/style.css
    const baseTag = `<base href="/preview/${resolvedParams.id}/">`;
    if (htmlContent && !htmlContent.includes('<base')) {
        // Insert after <head> or at the start of the document
        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n    ${baseTag}`);
        } else if (htmlContent.includes('<head ')) {
            htmlContent = htmlContent.replace(/<head[^>]*>/, (match) => `${match}\n    ${baseTag}`);
        } else {
            // Prepend if no head tag
            htmlContent = baseTag + '\n' + htmlContent;
        }
    }

    return (
        <TemplateRenderer
            content={content}
            htmlContent={htmlContent}
            showCheckout={true}
            templateName={template.name}
        />
    );
}
