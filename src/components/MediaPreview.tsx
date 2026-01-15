'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaPreviewProps {
    url: string;
    onClose: () => void;
}

export default function MediaPreview({ url, onClose }: MediaPreviewProps) {
    const isVideo = /\.(mp4|webm|mov|avi|mkv|ts|mpg|mpeg)$/i.test(url);
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    position: 'relative',
                    cursor: 'default'
                }}
            >
                {isVideo ? (
                    <video
                        src={url}
                        controls
                        autoPlay
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            borderRadius: '8px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    />
                ) : (
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}>
                        <Image
                            src={url}
                            alt="Preview"
                            width={1200}
                            height={800}
                            style={{
                                objectFit: 'contain',
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                borderRadius: '8px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                            }}
                            unoptimized
                        />
                    </div>
                )}

                {/* Actions Container */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '0',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    <button
                        onClick={handleCopy}
                        style={{
                            background: copied ? '#238636' : 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {copied ? '✓ Copied' : '📋 Copy URL'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* URL display */}
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#888',
                    fontFamily: 'monospace',
                    maxWidth: '80vw',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {url}
                </div>
            </div>
        </div>
    );
}
