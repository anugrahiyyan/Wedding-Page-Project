'use client';

import { useState, useTransition } from 'react';
import { warmUpSubdomain } from '@/app/lib/actions';

interface WarmUpButtonProps {
    subdomain: string;
}

export default function WarmUpButton({ subdomain }: WarmUpButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    function handleWarmUp() {
        setResult(null);
        startTransition(async () => {
            const response = await warmUpSubdomain(subdomain);
            setResult(response);
            // Auto-hide result after 5 seconds
            setTimeout(() => setResult(null), 5000);
        });
    }

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
                onClick={handleWarmUp}
                disabled={isPending}
                style={{
                    background: 'transparent',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: isPending ? 'wait' : 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    opacity: isPending ? 0.6 : 1,
                }}
                title="Ping subdomain to warm up Cloudflare cache"
            >
                {isPending ? '⏳' : '🔥'} Warm-up
            </button>
            {result && (
                <span
                    style={{
                        fontSize: '0.75rem',
                        color: result.success ? '#22c55e' : '#ef4444',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={result.message}
                >
                    {result.success ? '✓ Pinged!' : '✗ Failed'}
                </span>
            )}
        </div>
    );
}
