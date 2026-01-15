'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getTemplateFiles, saveTemplateFiles, getInvoiceFiles, saveInvoiceFiles } from '@/app/lib/file-actions';
import MediaManager from '@/components/MediaManager';
import MediaPreview from '@/components/MediaPreview';
import FileExplorer from '@/components/FileExplorer';
import { VirtualFile } from '@/types/virtual-file';
import styles from './editor.module.css';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface OpenTab {
    id: string;
    name: string;
    language: string;
}

interface EditorProps {
    template: {
        id: string;
        name: string;
        thumbnail?: string | null;
    };
    mode?: 'template' | 'invoice';
    // For invoice mode, rootDomain is useful for preview links. 
    // For template mode, it's less critical as we use /preview/[id], but consistent interface helps.
    rootDomain?: string;
    subdomain?: string; // for invoice preview
}

export default function Editor({ template, mode = 'template', rootDomain, subdomain }: EditorProps) {
    const [files, setFiles] = useState<VirtualFile[]>([]);
    const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [activeLanguage, setActiveLanguage] = useState('html');

    const [thumbnail, setThumbnail] = useState(template.thumbnail || '');
    const [isSaving, setIsSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showMediaManager, setShowMediaManager] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<'clipboard' | 'thumbnail' | 'insert'>('clipboard');
    const [previewVisible, setPreviewVisible] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    const [editorInstance, setEditorInstance] = useState<any>(null);
    const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });

    // Load files on mount
    useEffect(() => {
        const loadFiles = async () => {
            let loadedFiles: VirtualFile[] = [];
            if (mode === 'invoice') {
                loadedFiles = await getInvoiceFiles(template.id);
            } else {
                loadedFiles = await getTemplateFiles(template.id);
            }

            setFiles(loadedFiles);
            const main = loadedFiles.find(f => f.name === 'index.html');
            if (main) {
                openFile(main, loadedFiles);
            }
        };
        loadFiles();
    }, [template.id, mode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl+B to toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setSidebarVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [files, thumbnail]);

    const getLanguage = (name: string): string => {
        if (name.endsWith('.css')) return 'css';
        if (name.endsWith('.js')) return 'javascript';
        if (name.endsWith('.json')) return 'json';
        return 'html';
    };

    const isMediaFile = (name: string): boolean => {
        return /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff|mp4|webm|mov|avi|mkv|ts|mpg|mpeg|avif)$/i.test(name);
    };

    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

    const openFile = (file: VirtualFile, currentFiles?: VirtualFile[]) => {
        const filesTree = currentFiles || files;

        // Check if this is a media file - show preview instead of editor
        if (isMediaFile(file.name)) {
            // Content is the URL for uploaded files
            const content = file.content || '';
            if (content.startsWith('/') || content.startsWith('http')) {
                setMediaPreviewUrl(content);
                return;
            }
        }

        // Use functional setState to prevent race condition duplicates
        setOpenTabs(prev => {
            if (prev.find(t => t.id === file.id)) return prev;
            return [...prev, { id: file.id, name: file.name, language: getLanguage(file.name) }];
        });
        setActiveFileId(file.id);
        setActiveLanguage(getLanguage(file.name));
        const findContent = (nodes: VirtualFile[]): string => {
            for (const n of nodes) {
                if (n.id === file.id) return n.content || '';
                if (n.children) {
                    const found = findContent(n.children);
                    if (found !== '') return found;
                }
            }
            return '';
        };
        setFileContent(findContent(filesTree));
    };

    const closeTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenTabs(prev => prev.filter(t => t.id !== tabId));
        if (activeFileId === tabId) {
            const remaining = openTabs.filter(t => t.id !== tabId);
            if (remaining.length > 0) {
                const lastTab = remaining[remaining.length - 1];
                const file = findFileById(files, lastTab.id);
                if (file) openFile(file);
            } else {
                setActiveFileId(null);
                setFileContent('');
            }
        }
    };

    const findFileById = (nodes: VirtualFile[], id: string): VirtualFile | null => {
        for (const n of nodes) {
            if (n.id === id) return n;
            if (n.children) {
                const found = findFileById(n.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleEditorDidMount = (editor: any) => {
        setEditorInstance(editor);
        editor.onDidChangeCursorPosition((e: any) => {
            setCursorPosition({ lineNumber: e.position.lineNumber, column: e.position.column });
        });
    };

    const onEditorChange = (value: string | undefined) => {
        const newValue = value || '';
        setFileContent(newValue);
        if (activeFileId) {
            setFiles(prev => updateFileContent(prev, activeFileId, newValue));
        }
    };

    const updateFileContent = (nodes: VirtualFile[], id: string, newContent: string): VirtualFile[] => {
        return nodes.map(node => {
            if (node.id === id) return { ...node, content: newContent };
            if (node.children) return { ...node, children: updateFileContent(node.children, id, newContent) };
            return node;
        });
    };

    const handleFileSelect = (file: VirtualFile) => openFile(file);

    const handleCreateFile = (parentId: string | null, name: string, type: 'file' | 'folder') => {
        const newFile: VirtualFile = {
            id: crypto.randomUUID(), name, type,
            content: type === 'file' ? '' : undefined,
            children: type === 'folder' ? [] : undefined
        };
        if (!parentId) {
            setFiles(prev => [...prev, newFile]);
        } else {
            const addNode = (nodes: VirtualFile[]): VirtualFile[] => nodes.map(node => {
                if (node.id === parentId && node.type === 'folder') {
                    return { ...node, children: [...(node.children || []), newFile], isOpen: true };
                }
                if (node.children) return { ...node, children: addNode(node.children) };
                return node;
            });
            setFiles(addNode(files));
        }
    };

    const handleDeleteFile = (fileId: string) => {
        const removeNode = (nodes: VirtualFile[]): VirtualFile[] => {
            return nodes.filter(node => node.id !== fileId).map(node => {
                if (node.children) return { ...node, children: removeNode(node.children) };
                return node;
            });
        };
        setFiles(removeNode(files));
        setOpenTabs(prev => prev.filter(t => t.id !== fileId));
        if (activeFileId === fileId) { setActiveFileId(null); setFileContent(''); }
    };

    const handleMoveFile = (fileId: string, direction: 'up' | 'down') => {
        const moveInArray = (arr: VirtualFile[]): VirtualFile[] => {
            const idx = arr.findIndex(f => f.id === fileId);
            if (idx === -1) {
                return arr.map(node => {
                    if (node.children) return { ...node, children: moveInArray(node.children) };
                    return node;
                });
            }
            const newArr = [...arr];
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx >= 0 && swapIdx < newArr.length) {
                [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
            }
            return newArr;
        };
        setFiles(moveInArray(files));
    };

    const insertImageAtCursor = (url: string) => {
        if (editorInstance) {
            const position = editorInstance.getPosition();
            const textToInsert = `<img src="${url}" alt="Image" class="w-full h-auto rounded-lg shadow-md my-4" />`;
            editorInstance.executeEdits('insert-image', [{
                range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
                text: textToInsert, forceMoveMarkers: true
            }]);
            editorInstance.focus();
        } else {
            setFileContent(prev => prev + `\n<img src="${url}" alt="Image" class="w-full h-auto rounded-lg shadow-md my-4" />`);
        }
    };

    const handleSave = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);

        let success = false;
        if (mode === 'invoice') {
            const res = await saveInvoiceFiles(template.id, files, thumbnail);
            success = res.success;
        } else {
            const res = await saveTemplateFiles(template.id, files, thumbnail);
            success = res.success;
        }

        setIsSaving(false);
        setRefreshKey(prev => prev + 1);
        setToast('Saved!');
        setTimeout(() => setToast(null), 2000);
    }, [files, thumbnail, template.id, isSaving, mode]);

    const handleUploadComplete = (uploads: { url: string, name: string }[]) => {
        setFiles(prev => {
            const nextFiles = JSON.parse(JSON.stringify(prev)) as VirtualFile[];

            const getOrCreateFolder = (parentChildren: VirtualFile[], name: string): VirtualFile => {
                let folder = parentChildren.find(f => f.name === name && f.type === 'folder');
                if (!folder) {
                    folder = {
                        id: `${name}-folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        name: name,
                        type: 'folder',
                        isOpen: true,
                        children: []
                    };
                    parentChildren.push(folder);
                }
                return folder;
            };

            // 1. Ensure 'uploads' folder exists at root
            let uploadsFolder = getOrCreateFolder(nextFiles, 'uploads');
            if (!uploadsFolder.children) uploadsFolder.children = [];
            uploadsFolder.isOpen = true;

            // 2. Process each upload
            uploads.forEach(u => {
                // Determine subfolder based on URL path or file extension
                // Logic: url is like /uploads/[id]/images/file.jpg
                const isImage = /\/images\//.test(u.url) || /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff|avif)$/i.test(u.name);
                const subfolderName = isImage ? 'images' : 'videos';

                // Get or create the subfolder (images or videos) inside uploads
                const subFolder = getOrCreateFolder(uploadsFolder.children!, subfolderName);
                if (!subFolder.children) subFolder.children = [];

                // Add file to subfolder
                subFolder.children.push({
                    id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: u.name,
                    type: 'file',
                    content: u.url
                });

                // Ensure folders are open to show the new file
                subFolder.isOpen = true;
            });

            return nextFiles;
        });

        // Auto-save the project so these files persist in DB immediately
        setToast('Files added to Explorer!');
        setTimeout(() => setToast(null), 3000);
    };

    const handleMediaSelect = (url: string) => {
        if (mediaTarget === 'thumbnail') setThumbnail(url);
        else if (mediaTarget === 'insert') insertImageAtCursor(url);
        else { navigator.clipboard.writeText(url); setToast(`Copied!`); setTimeout(() => setToast(null), 2000); }
        setShowMediaManager(false);
    };

    const previewSrc = mode === 'invoice' && subdomain && rootDomain
        ? `http://${subdomain}.${rootDomain}` // Or appropriate path logic
        : `/preview/${template.id}`;

    // Improve preview logic for invoices
    // If BASIC mode: http://root/s/subdomain
    // But we don't have that info conveniently unless passed. 
    // We'll rely on what's passed or default to stored htmlContent preview if possible?
    // Actually, for invoices, the best preview is the live one.
    // If `subdomain` is passed, use it. The `page` component knows the full URL logic.
    // Let's refine `previewSrc`:
    const effectivePreviewSrc = (() => {
        if (mode === 'template') return `/preview/${template.id}`;
        // For invoice mode, use the path-based route which we know works with our asset serving
        if (subdomain) {
            return `/s/${subdomain}/`;
        }
        return `/preview/${template.id}`;
    })();

    return (
        <div className={styles.editorLayout}>
            {showMediaManager && <MediaManager onSelect={handleMediaSelect} onClose={() => setShowMediaManager(false)} templateId={template.id} onUploadComplete={handleUploadComplete} />}
            {mediaPreviewUrl && <MediaPreview url={mediaPreviewUrl} onClose={() => setMediaPreviewUrl(null)} />}
            {toast && <div className={styles.toast}>✓ {toast}</div>}

            {/* TOP BAR */}
            <header className={styles.topBar}>
                <nav className={styles.breadcrumbs}>
                    <Link href="/dashboard">Dashboard</Link>
                    <span className={styles.separator}>/</span>
                    <Link href={mode === 'invoice' ? "/dashboard/invoices" : "/dashboard/templates"}>
                        {mode === 'invoice' ? 'Invoices' : 'Templates'}
                    </Link>
                    <span className={styles.separator}>/</span>
                    <span>{template.name}</span>
                </nav>
                <div className={styles.actions}>
                    {mode === 'template' && (
                        <input type="url" placeholder="Thumbnail" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className={styles.input} style={{ width: 140 }} />
                    )}
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setMediaTarget('thumbnail'); setShowMediaManager(true); }} title="Upload Thumbnail">📷</button>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setMediaTarget('insert'); setShowMediaManager(true); }} title="Insert Media">🖼️</button>
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => window.open(effectivePreviewSrc, '_blank')} title="Open in New Tab">↗️</button>
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPreviewVisible(!previewVisible)} title="Toggle Preview">{previewVisible ? '◧' : '◨'}</button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={isSaving} title="Save (Ctrl+S)">{isSaving ? '...' : '💾 Save'}</button>
                </div>
            </header>

            {/* WORKSPACE */}
            <div className={styles.workspace}>
                {/* SIDEBAR */}
                <aside className={`${styles.sidebar} ${!sidebarVisible ? styles.sidebarCollapsed : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <span>Rabikuu {mode} Editor</span>
                        <button className={styles.sidebarToggle} onClick={() => setSidebarVisible(false)} title="Hide (Ctrl+B)">«</button>
                    </div>
                    <div className={styles.sidebarContent}>
                        <FileExplorer files={files} onSelect={handleFileSelect} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} onMoveFile={handleMoveFile} />
                    </div>
                </aside>

                {/* Collapsed sidebar toggle */}
                {!sidebarVisible && (
                    <button
                        className={styles.sidebarToggle}
                        onClick={() => setSidebarVisible(true)}
                        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, borderRadius: '0 4px 4px 0' }}
                        title="Show Explorer (Ctrl+B)"
                    >»</button>
                )}

                {/* EDITOR */}
                <div className={styles.editorMain}>
                    {/* MULTI-TAB BAR */}
                    <div className={styles.tabBar}>
                        {openTabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`${styles.tab} ${activeFileId === tab.id ? styles.tabActive : ''}`}
                                onClick={() => { const file = findFileById(files, tab.id); if (file) openFile(file); }}
                            >
                                <span className={styles.tabLang} style={{ color: tab.language === 'html' ? '#e34c26' : tab.language === 'css' ? '#563d7c' : '#f1e05a' }}>●</span>
                                <span className={styles.tabName}>{tab.name}</span>
                                <button className={styles.tabClose} onClick={(e) => closeTab(tab.id, e)}>×</button>
                            </div>
                        ))}
                        {openTabs.length === 0 && <span style={{ padding: '0.5rem 1rem', color: '#6e7681', fontSize: '0.8rem' }}>No files open</span>}
                    </div>
                    <div className={styles.editorContent}>
                        {activeFileId ? (
                            <MonacoEditor
                                height="100%"
                                language={activeLanguage}
                                theme="vs-dark"
                                value={fileContent}
                                onChange={onEditorChange}
                                onMount={handleEditorDidMount}
                                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true, padding: { top: 0, bottom: 0 }, scrollBeyondLastLine: false }}
                            />
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6e7681', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2rem' }}>📂</span>
                                <span>Select a file from Explorer</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.statusBar}>
                        <div className={styles.statusItems}>
                            <span>Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}</span>
                            <span>{activeLanguage.toUpperCase()}</span>
                        </div>
                        <div className={styles.statusItems}>
                            <span style={{ opacity: 0.7 }}>Ctrl+S save | Ctrl+B explorer</span>
                        </div>
                    </div>
                </div>

                {/* PREVIEW */}
                {previewVisible && (
                    <div className={styles.previewPane}>
                        <div className={styles.previewHeader}>
                            <span>Live Preview</span>
                            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setRefreshKey(p => p + 1)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>↻</button>
                        </div>
                        <div className={styles.previewContent}>
                            <iframe src={effectivePreviewSrc} className={styles.previewIframe} key={refreshKey} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}