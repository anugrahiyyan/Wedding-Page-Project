'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface UploadedFile {
    url: string;
    name: string;
    type: 'image' | 'video';
}

interface MediaManagerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
    templateId?: string;
    onUploadComplete?: (files: UploadedFile[]) => void;
}

const ACCEPTED_FORMATS = [
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif',
    // Videos  
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mp2t', 'video/mpeg'
].join(',');

export default function MediaManager({ onSelect, onClose, templateId, onUploadComplete }: MediaManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const processFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => formData.append('file', file));
        if (templateId) formData.append('templateId', templateId);

        try {
            const res = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                const newUploads = data.uploads as UploadedFile[];
                setUploadedFiles(prev => [...prev, ...newUploads]);

                // Trigger parent update immediately
                if (onUploadComplete) {
                    onUploadComplete(newUploads);
                }

                if (newUploads.length === 1) {
                    setSelectedFile(newUploads[0]);
                }

                showToast(`Uploaded ${newUploads.length} file(s)!`, 'success');
                if (data.errors) {
                    setError(data.errors.join('\n'));
                }
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        await processFiles(e.target.files);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.currentTarget === e.target) setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) await processFiles(e.dataTransfer.files);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backdropFilter: 'blur(8px)'
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(88, 166, 255, 0.15)',
                    border: '3px dashed #58a6ff',
                    zIndex: 100,
                    pointerEvents: 'none',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>📂 Drop files to upload</h2>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'success' ? '#238636' : '#da3633',
                    color: 'white', padding: '8px 16px', borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000,
                    fontWeight: 500, fontSize: '0.85rem'
                }}>
                    {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
                </div>
            )}

            {/* Modal */}
            <div style={{
                background: '#1a1a1a', borderRadius: '12px',
                width: '90%', maxWidth: '800px', maxHeight: '85vh',
                color: 'white', border: '1px solid #333',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1rem', color: '#e5e5e5' }}>Media Manager</h2>
                        {templateId && <span style={{ fontSize: '0.7rem', color: '#666' }}>→ /uploads/{templateId}/...</span>}
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#666',
                        cursor: 'pointer', fontSize: '1.25rem', padding: '0'
                    }}>×</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Left: Upload & Gallery */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', borderRight: '1px solid #333' }}>
                        {/* Upload Area */}
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            style={{
                                padding: '1.5rem',
                                border: '2px dashed #333',
                                background: '#151515',
                                borderRadius: '8px',
                                cursor: uploading ? 'default' : 'pointer',
                                textAlign: 'center',
                                marginBottom: '1rem',
                                borderColor: isDragging ? '#58a6ff' : uploading ? '#238636' : '#333'
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                accept={ACCEPTED_FORMATS}
                                style={{ display: 'none' }}
                                disabled={uploading}
                            />

                            {uploading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        border: '3px solid #333',
                                        borderTopColor: '#238636',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.25rem' }}>☁️</span>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#aaa' }}>
                                        Click or drag files (bulk supported)
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#555' }}>
                                        JPG, PNG, GIF, SVG, AVIF • MP4, MOV, MKV...
                                    </p>
                                </>
                            )}
                        </div>

                        {error && <p style={{ color: '#da3633', fontSize: '0.8rem', background: 'rgba(218,54,51,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{error}</p>}

                        {/* Gallery Grid */}
                        {uploadedFiles.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: '0.5rem'
                            }}>
                                {uploadedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedFile(file)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: selectedFile?.url === file.url ? '2px solid #58a6ff' : '2px solid transparent',
                                            background: '#0a0a0a',
                                            position: 'relative'
                                        }}
                                    >
                                        {file.type === 'video' ? (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: '#1a1a1a', color: '#666'
                                            }}>
                                                🎬
                                            </div>
                                        ) : (
                                            <Image src={file.url} alt={file.name} fill style={{ objectFit: 'cover' }} unoptimized />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Preview */}
                    <div style={{ width: '320px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            flex: 1,
                            background: '#0a0a0a',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            position: 'relative'
                        }}>
                            {selectedFile ? (
                                selectedFile.type === 'video' ? (
                                    <video
                                        src={selectedFile.url}
                                        controls
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                ) : (
                                    <Image
                                        src={selectedFile.url}
                                        alt={selectedFile.name}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                )
                            ) : (
                                <span style={{ color: '#444', fontSize: '0.85rem' }}>Select a file to preview</span>
                            )}
                        </div>

                        {selectedFile && (
                            <>
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedFile.url}
                                    style={{
                                        width: '100%', padding: '0.5rem', background: '#252525',
                                        border: '1px solid #333', color: '#aaa', borderRadius: '4px',
                                        fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.75rem'
                                    }}
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    onClick={() => onSelect(selectedFile.url)}
                                    style={{
                                        background: '#238636', color: '#fff', border: 'none',
                                        padding: '0.6rem', borderRadius: '6px', fontWeight: 500,
                                        cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >
                                    ✓ Select & Insert
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
