'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaManagerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export default function MediaManager({ onSelect, onClose }: MediaManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        setError(null);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setUploadedUrl(data.url);
                showToast('Upload successful!', 'success');
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {toast && (
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'success' ? '#4caf50' : '#ff4444',
                    color: 'white', padding: '10px 20px', borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000,
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
                </div>
            )}

            <div style={{
                background: '#1a1a1a', padding: '2rem', borderRadius: '12px',
                width: '90%', maxWidth: '600px', color: 'white',
                border: '1px solid #333', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#d4a68d' }}>🖼️ Media Manager</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#888',
                        cursor: 'pointer', fontSize: '2rem', lineHeight: '1', padding: '0 0.5rem'
                    }}>&times;</button>
                </div>

                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '3rem', border: '2px dashed #444', background: 'rgba(255,255,255,0.02)',
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', gap: '1rem'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#d4a68d'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#444'}>
                        <input type="file" onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
                        <span style={{ fontSize: '2rem' }}>☁️</span>
                        <span style={{ fontSize: '1.1rem', color: '#ccc' }}>
                            {uploading ? 'Uploading...' : 'Click to Upload Image / Video'}
                        </span>
                    </label>
                    {error && <p style={{ color: '#ff4444', marginTop: '1rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
                </div>

                {uploadedUrl && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            position: 'relative', height: '250px', width: '100%',
                            background: '#0a0a0a', marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden',
                            border: '1px solid #333'
                        }}>
                            <Image
                                src={uploadedUrl}
                                alt="Uploaded"
                                fill
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                readOnly
                                value={uploadedUrl}
                                style={{
                                    flex: 1, padding: '0.8rem', background: '#333',
                                    border: '1px solid #444', color: '#fff', borderRadius: '4px',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                onSelect(uploadedUrl);
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #d4a68d 0%, #c08e72 100%)',
                                color: '#1a0a0a', border: 'none',
                                padding: '1rem 2rem', borderRadius: '50px', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '1rem',
                                boxShadow: '0 4px 15px rgba(212, 166, 141, 0.3)',
                                transition: 'transform 0.1s',
                                width: '100%'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Select & Copy URL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
