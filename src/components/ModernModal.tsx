'use client';

import React, { useState, useEffect, useRef } from 'react';

const cssKeyframes = `
@keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes modalSlideIn {
    from { 
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
`;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <style>{cssKeyframes}</style>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    animation: 'modalFadeIn 0.15s ease-out',
                }}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#1f1f1f',
                        borderRadius: '8px',
                        minWidth: '300px',
                        maxWidth: '400px',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
                        border: '1px solid #333',
                        animation: 'modalSlideIn 0.2s ease-out',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid #333',
                    }}>
                        <h3 style={{
                            margin: 0,
                            color: '#e5e5e5',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                        }}>{title}</h3>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1rem' }}>
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderTop: '1px solid #333',
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                            background: '#191919',
                            borderRadius: '0 0 8px 8px',
                        }}>
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Compact button styles
const btnCancel: React.CSSProperties = {
    padding: '0.4rem 0.875rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#2a2a2a',
    color: '#999',
    border: '1px solid #404040',
    transition: 'all 0.15s',
};

const btnPrimary: React.CSSProperties = {
    padding: '0.4rem 0.875rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#238636',
    color: '#fff',
    border: '1px solid #238636',
    transition: 'all 0.15s',
};

const btnDanger: React.CSSProperties = {
    padding: '0.4rem 0.875rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#da3633',
    color: '#fff',
    border: '1px solid #da3633',
    transition: 'all 0.15s',
};

interface InputModalProps {
    isOpen: boolean;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

export function InputModal({ isOpen, title, placeholder, defaultValue = '', onSubmit, onCancel }: InputModalProps) {
    const [value, setValue] = useState(defaultValue);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [isOpen, defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            footer={
                <>
                    <button type="button" onClick={onCancel} style={btnCancel}>Cancel</button>
                    <button type="submit" form="input-form" style={btnPrimary}>Create</button>
                </>
            }
        >
            <form id="input-form" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        background: '#151515',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: focused ? '#58a6ff' : '#404040',
                        borderRadius: '4px',
                        color: '#e5e5e5',
                        outline: 'none',
                        transition: 'border-color 0.15s',
                        boxSizing: 'border-box',
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </form>
        </Modal>
    );
}

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger, onConfirm, onCancel }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            footer={
                <>
                    <button onClick={onCancel} style={btnCancel}>{cancelText}</button>
                    <button onClick={onConfirm} style={danger ? btnDanger : btnPrimary}>{confirmText}</button>
                </>
            }
        >
            <p style={{ color: '#999', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{message}</p>
        </Modal>
    );
}
