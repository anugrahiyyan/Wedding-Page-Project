'use client';

import React, { useState } from 'react';
import { VirtualFile } from '@/types/virtual-file';
import { InputModal, ConfirmModal } from './ModernModal';

interface FileExplorerProps {
    files: VirtualFile[];
    onSelect: (file: VirtualFile) => void;
    onCreateFile: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
    onDeleteFile: (fileId: string) => void;
    onMoveFile?: (fileId: string, direction: 'up' | 'down') => void;
}

const FileItem = ({
    file,
    level,
    index,
    totalSiblings,
    onSelect,
    onCreateFile,
    onDeleteFile,
    onMoveFile,
    onRequestInput,
    onRequestConfirm
}: {
    file: VirtualFile,
    level: number,
    index: number,
    totalSiblings: number,
    onSelect: (f: VirtualFile) => void,
    onCreateFile: (pid: string | null, n: string, t: 'file' | 'folder') => void,
    onDeleteFile: (fid: string) => void,
    onMoveFile?: (fid: string, dir: 'up' | 'down') => void,
    onRequestInput: (title: string, placeholder: string, callback: (val: string) => void) => void,
    onRequestConfirm: (title: string, message: string, callback: () => void) => void
}) => {
    const [isOpen, setIsOpen] = useState(file.isOpen || false);
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (file.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onSelect(file);
        }
    };

    return (
        <div style={{ marginLeft: level * 12 }}>
            <div
                onClick={handleToggle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#ccc',
                    borderRadius: '4px',
                    background: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{file.type === 'folder' ? (isOpen ? '📂' : '📁') : getFileIcon(file.name)}</span>
                    <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                </div>
                {isHovered && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {onMoveFile && index > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); onMoveFile(file.id, 'up'); }} style={actionButtonStyle} title="Move Up">↑</button>
                        )}
                        {onMoveFile && index < totalSiblings - 1 && (
                            <button onClick={(e) => { e.stopPropagation(); onMoveFile(file.id, 'down'); }} style={actionButtonStyle} title="Move Down">↓</button>
                        )}
                        {file.type === 'folder' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestInput('New File', 'Enter file name (e.g. page.html)', (name) => {
                                        onCreateFile(file.id, name, 'file');
                                    });
                                }}
                                style={actionButtonStyle}
                                title="New File"
                            >+</button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRequestConfirm('Delete File', `Are you sure you want to delete "${file.name}"?`, () => {
                                    onDeleteFile(file.id);
                                });
                            }}
                            style={{ ...actionButtonStyle, color: '#ff4444' }}
                            title="Delete"
                        >×</button>
                    </div>
                )}
            </div>
            {file.type === 'folder' && isOpen && file.children && (
                <div>
                    {file.children.map((child, idx) => (
                        <FileItem
                            key={child.id}
                            file={child}
                            level={level + 1}
                            index={idx}
                            totalSiblings={file.children?.length || 0}
                            onSelect={onSelect}
                            onCreateFile={onCreateFile}
                            onDeleteFile={onDeleteFile}
                            onMoveFile={onMoveFile}
                            onRequestInput={onRequestInput}
                            onRequestConfirm={onRequestConfirm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileExplorer({ files, onSelect, onCreateFile, onDeleteFile, onMoveFile }: FileExplorerProps) {
    // Modal state
    const [inputModal, setInputModal] = useState<{ open: boolean; title: string; placeholder: string; callback: (val: string) => void }>({
        open: false, title: '', placeholder: '', callback: () => { }
    });
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; callback: () => void }>({
        open: false, title: '', message: '', callback: () => { }
    });

    const requestInput = (title: string, placeholder: string, callback: (val: string) => void) => {
        setInputModal({ open: true, title, placeholder, callback });
    };

    const requestConfirm = (title: string, message: string, callback: () => void) => {
        setConfirmModal({ open: true, title, message, callback });
    };

    return (
        <>
            <InputModal
                isOpen={inputModal.open}
                title={inputModal.title}
                placeholder={inputModal.placeholder}
                onSubmit={(val) => { inputModal.callback(val); setInputModal(p => ({ ...p, open: false })); }}
                onCancel={() => setInputModal(p => ({ ...p, open: false }))}
            />
            <ConfirmModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete"
                danger
                onConfirm={() => { confirmModal.callback(); setConfirmModal(p => ({ ...p, open: false })); }}
                onCancel={() => setConfirmModal(p => ({ ...p, open: false }))}
            />

            <div style={{
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                color: '#e0e0e0',
                fontSize: '0.9rem',
                height: '100%'
            }}>
                <div style={{
                    padding: '10px 1rem',
                    borderBottom: '1px solid #333',
                    fontWeight: 'bold',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#252526'
                }}>
                    <span>Files</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => requestInput('New Folder', 'Enter folder name', (name) => onCreateFile(null, name, 'folder'))}
                            style={actionButtonStyle}
                            title="New Folder"
                        >📁+</button>
                        <button
                            onClick={() => requestInput('New File', 'Enter file name (e.g. app.js)', (name) => onCreateFile(null, name, 'file'))}
                            style={actionButtonStyle}
                            title="New File"
                        >📄+</button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                    {files.map((file, idx) => (
                        <FileItem
                            key={file.id}
                            file={file}
                            level={1}
                            index={idx}
                            totalSiblings={files.length}
                            onSelect={onSelect}
                            onCreateFile={onCreateFile}
                            onDeleteFile={onDeleteFile}
                            onMoveFile={onMoveFile}
                            onRequestInput={requestInput}
                            onRequestConfirm={requestConfirm}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

const actionButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '0 3px',
    lineHeight: '1',
};

function getFileIcon(name: string) {
    if (name.endsWith('.html')) return '🌐';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.js')) return '📜';
    if (name.endsWith('.json')) return '🔧';
    if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '🖼️';
    return '📄';
}
