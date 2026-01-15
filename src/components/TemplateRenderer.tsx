'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './TemplateRenderer.module.css';

interface WishMessage {
    guestName: string;
    comment: string | null;
    createdAt: Date;
}

export default function TemplateRenderer({
    content,
    showCheckout = false,
    templateName = 'Template',
    subdomain = '',
    initialWishes = [],
    htmlContent = null,
    guestName = null,
}: {
    content: any,
    showCheckout?: boolean,
    templateName?: string,
    subdomain?: string,
    initialWishes?: WishMessage[],
    htmlContent?: string | null,
    guestName?: string | null
}) {
    const [wishes, setWishes] = useState<WishMessage[]>(initialWishes);
    const [currentBubble, setCurrentBubble] = useState<WishMessage | null>(null);
    const [bubbleIndex, setBubbleIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Show bubbles logic (client-only effect)
    useEffect(() => {
        if (wishes.length === 0) return;
        const sortedWishes = [...wishes].reverse();

        const showNextBubble = () => {
            setCurrentBubble(sortedWishes[bubbleIndex % sortedWishes.length]);
            setTimeout(() => {
                setCurrentBubble(null);
                setTimeout(() => {
                    setBubbleIndex(prev => (prev + 1) % sortedWishes.length);
                }, 500);
            }, 2500);
        };
        showNextBubble();
    }, [bubbleIndex, wishes]);

    // Auto-fill guest name logic (client-only)
    useEffect(() => {
        if (guestName && typeof window !== 'undefined') {
            const inputs = document.querySelectorAll('input[name="guestName"]');
            inputs.forEach(input => {
                (input as HTMLInputElement).value = guestName;
            });
        }
    }, [guestName, htmlContent]);

    // Expose global functions for HTML templates (client-only)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const triggerBubble = (name: string, comment: string) => {
            if (comment) {
                const newWish = {
                    guestName: name,
                    comment,
                    createdAt: new Date()
                };
                setWishes(prev => [newWish, ...prev]);
                setCurrentBubble(newWish);
            }
        };

        (window as any).addRsvpBubble = triggerBubble;

        (window as any).submitRsvpForm = async (e: Event) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const hiddenField = form.querySelector('#subdomain-field') as HTMLInputElement;
            const msg = form.querySelector('#rsvp-message');
            const btn = form.querySelector('#submit-btn') as HTMLButtonElement;

            if (!hiddenField?.value && !window.location.pathname.includes('preview')) {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const sIndex = pathParts.indexOf('s');
                if (sIndex !== -1 && pathParts[sIndex + 1]) {
                    hiddenField.value = pathParts[sIndex + 1];
                }
                if (!hiddenField?.value) {
                    alert('Error: Could not detect subdomain.');
                    return false;
                }
            }

            if (window.location.pathname.includes('preview')) {
                if (msg) msg.textContent = 'Preview Mode: RSVP received.';
                const fd = new FormData(form);
                triggerBubble(fd.get('guestName') as string, fd.get('comment') as string);
                return false;
            }

            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Sending...';
            }
            if (msg) msg.textContent = '';

            const formData = new FormData(form);
            const payload = {
                subdomain: hiddenField.value,
                guestName: formData.get('guestName'),
                email: formData.get('email'),
                attending: formData.get('attending') === 'true',
                comment: formData.get('comment')
            };

            try {
                const res = await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    if (msg) {
                        msg.textContent = 'Thank you! Your RSVP has been sent. 🎉';
                        msg.className = 'success';
                    }
                    form.reset();
                    hiddenField.value = payload.subdomain;
                    triggerBubble(payload.guestName as string, payload.comment as string);
                    fireConfetti();
                } else if (msg) {
                    msg.textContent = 'Error: ' + (data.error || 'Failed to send');
                    msg.className = 'error';
                }
            } catch (error) {
                if (msg) {
                    msg.textContent = 'Network error. Please try again.';
                    msg.className = 'error';
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Send Confirmation';
                }
            }
            return false;
        };

        return () => {
            delete (window as any).addRsvpBubble;
            delete (window as any).submitRsvpForm;
        };
    }, [subdomain]);

    const fireConfetti = () => {
        if (typeof document === 'undefined') return;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 100; i++) {
            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'fixed', width: '10px', height: '10px',
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                left: '50%', top: '50%', zIndex: '9999', pointerEvents: 'none', borderRadius: '50%'
            });
            document.body.appendChild(p);
            const angle = Math.random() * Math.PI * 2;
            const tx = Math.cos(angle) * 300 * Math.random();
            const ty = Math.sin(angle) * 300 * Math.random();
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)',
            }).onfinish = () => p.remove();
        }
    };

    // Script hydration (client-only)
    useEffect(() => {
        if (!htmlContent || !wrapperRef.current || typeof window === 'undefined') return;
        const container = wrapperRef.current;
        const scripts = container.querySelectorAll('script');
        scripts.forEach((script) => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    }, [htmlContent]);

    // Process HTML content - this runs on BOTH server and client for consistent output
    if (htmlContent) {
        let injectedHtml = htmlContent;

        // Inject base tag if we have a valid subdomain and no existing base tag
        if (subdomain && !/<base[\s>\/]/i.test(htmlContent)) {
            const baseTag = `<base href="/s/${subdomain}/" />`;

            if (/<head>/i.test(htmlContent)) {
                injectedHtml = htmlContent.replace(/<head>/i, `<head>${baseTag}`);
            } else if (/<head\s[^>]*>/i.test(htmlContent)) {
                injectedHtml = htmlContent.replace(/<head\s[^>]*>/i, `$&${baseTag}`);
            } else if (/<html[^>]*>/i.test(htmlContent)) {
                injectedHtml = htmlContent.replace(/<html[^>]*>/i, `$&<head>${baseTag}</head>`);
            } else {
                // Fallback: prepend base tag
                injectedHtml = `<head>${baseTag}</head>${htmlContent}`;
            }
        }

        // Inject subdomain value into hidden field
        injectedHtml = injectedHtml.replace(
            /id\s*=\s*["']subdomain-field["']/i,
            (match) => `${match} value="${subdomain}"`
        );

        // Replace guest name placeholders
        if (guestName) {
            injectedHtml = injectedHtml
                .replace(/\{\{\s*guest_name\s*\}\}/gi, guestName)
                .replace(/\[\s*guest_name\s*\]/gi, guestName);
        } else {
            injectedHtml = injectedHtml
                .replace(/\{\{\s*guest_name\s*\}\}/gi, "Family & Friends")
                .replace(/\[\s*guest_name\s*\]/gi, "Family & Friends");
        }

        return (
            <div ref={wrapperRef} className={styles.wrapper}>
                <div dangerouslySetInnerHTML={{ __html: injectedHtml }} />
                {currentBubble && (
                    <div className={styles.broadcastContainer}>
                        <div className={styles.broadcastBubble}>
                            <strong>{currentBubble.guestName}</strong>
                            <p>{currentBubble.comment}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', color: '#666' }}>
            <h2>Empty Template</h2>
            <p>This template has no content. Open the Editor to add an index.html file.</p>
        </div>
    );
}
