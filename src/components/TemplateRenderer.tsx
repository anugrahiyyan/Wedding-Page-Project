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
    htmlContent = null
}: {
    content: any,
    showCheckout?: boolean,
    templateName?: string,
    subdomain?: string,
    initialWishes?: WishMessage[],
    htmlContent?: string | null
}) {
    const [isClient, setIsClient] = useState(false);
    const [wishes, setWishes] = useState<WishMessage[]>(initialWishes);
    const [currentBubble, setCurrentBubble] = useState<WishMessage | null>(null);
    const [bubbleIndex, setBubbleIndex] = useState(0);
    const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [rsvpMessage, setRsvpMessage] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show bubbles one at a time, each visible for 2.5s, cycle from oldest to newest
    useEffect(() => {
        if (wishes.length === 0) return;

        // Sort wishes oldest first so we show from first submit to last
        const sortedWishes = [...wishes].reverse();

        const showNextBubble = () => {
            setCurrentBubble(sortedWishes[bubbleIndex % sortedWishes.length]);

            // After 2.5s, hide the bubble
            setTimeout(() => {
                setCurrentBubble(null);
                // Wait 0.5s before showing next bubble
                setTimeout(() => {
                    setBubbleIndex(prev => (prev + 1) % sortedWishes.length);
                }, 500);
            }, 2500);
        };

        showNextBubble();
    }, [bubbleIndex, wishes]);

    // Expose function for HTML templates to trigger bubbles
    useEffect(() => {
        // Helper to trigger bubble
        const triggerBubble = (name: string, comment: string) => {
            if (comment) {
                const newWish = {
                    guestName: name,
                    comment,
                    createdAt: new Date()
                };
                setWishes(prev => [newWish, ...prev]);

                // FORCE SHOW the new bubble immediately for feedback
                setCurrentBubble(newWish);
                // Resume cycle after this one finishes (2.5s + 0.5s padding)
            }
        };

        (window as any).addRsvpBubble = triggerBubble;

        // --- NEW: Global RSVP Handler (Robust) ---
        // We expose the handler to window so the HTML can call it directly via onsubmit="..."
        // This bypasses all React hydration/listener attachment race conditions.
        (window as any).submitRsvpForm = async (e: Event) => {
            e.preventDefault();
            console.log('[TemplateRenderer] Global submitRsvpForm called');

            const form = e.target as HTMLFormElement;
            const hiddenField = form.querySelector('#subdomain-field') as HTMLInputElement;
            const msg = form.querySelector('#rsvp-message');
            const btn = form.querySelector('#submit-btn') as HTMLButtonElement;

            // Fallback subdomain detection if hidden field is empty
            if (!hiddenField?.value) {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const sIndex = pathParts.indexOf('s');
                if (sIndex !== -1 && pathParts[sIndex + 1]) {
                    hiddenField.value = pathParts[sIndex + 1];
                }
            }

            if (!hiddenField?.value && !window.location.pathname.includes('preview')) {
                alert('Error: Could not detect subdomain.');
                return false;
            }

            // Preview Mode
            if (window.location.pathname.includes('preview')) {
                if (msg) msg.textContent = 'Preview Mode: RSVP received.';
                const fd = new FormData(form);
                triggerBubble(fd.get('guestName') as string, fd.get('comment') as string);
                return false;
            }

            // Real Submission
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
                    // Restore subdomain after reset
                    hiddenField.value = payload.subdomain;
                    triggerBubble(payload.guestName as string, payload.comment as string);
                    fireConfetti(); // Trigger celebration!
                } else if (msg) {
                    msg.textContent = 'Error: ' + (data.error || 'Failed to send');
                    msg.className = 'error';
                }
            } catch (error) {
                console.error(error);
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

    // --- Confetti Effect Helper ---
    const fireConfetti = () => {
        if (typeof document === 'undefined') return;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 100; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.width = '10px';
            p.style.height = '10px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.zIndex = '9999';
            p.style.pointerEvents = 'none';
            p.style.borderRadius = '50%';
            document.body.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 5;
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
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        if (!content.countdown?.targetDate) return;
        const target = new Date(content.countdown.targetDate).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = target - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft(null);
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [content.countdown?.targetDate]);

    // RSVP Form Submit Handler
    const handleRsvpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!subdomain) {
            setRsvpMessage('Preview mode - RSVP disabled');
            return;
        }

        setRsvpStatus('submitting');
        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch('/api/rsvp', {
                method: 'POST',
                body: JSON.stringify({
                    subdomain,
                    guestName: formData.get('guestName'),
                    email: formData.get('email') || '',
                    attending: formData.get('attending') === 'Will Attend',
                    allergies: formData.get('allergies') || '',
                    comment: formData.get('comment') || '',
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.success) {
                setRsvpStatus('success');
                setRsvpMessage('Thank you for your response! 🎉');
                // Add new wish to bubbles if there's a comment
                const comment = formData.get('comment') as string;
                if (comment) {
                    const newWish: WishMessage = {
                        guestName: formData.get('guestName') as string,
                        comment,
                        createdAt: new Date()
                    };
                    setWishes(prev => [newWish, ...prev]);
                }
                (e.target as HTMLFormElement).reset();
            } else {
                setRsvpStatus('error');
                setRsvpMessage(data.error || 'Failed to submit');
            }
        } catch (error) {
            setRsvpStatus('error');
            setRsvpMessage('Network error. Please try again.');
        }
    }



    // --- Confetti Effect Helper ---




    const wrapperRef = useRef<HTMLDivElement>(null);

    if (!isClient) return <div className={styles.wrapper} style={{ minHeight: '100vh' }}></div>;

    const waLink = `https://wa.me/6281230826731?text=Hi,%20saya%20ingin%20pesan%20template:%20${encodeURIComponent(templateName)}`;

    // If HTML content is present, render it directly
    if (htmlContent) {
        // Inject subdomain into any element with id="subdomain-field"
        const injectedHtml = htmlContent.replace(
            /id\s*=\s*["']subdomain-field["']/i,
            (match) => `${match} value="${subdomain}"`
        );
        return (
            <div ref={wrapperRef} className={styles.wrapper}>
                <div dangerouslySetInnerHTML={{ __html: injectedHtml }} />

                {/* Broadcast Bubbles - Bottom Right */}
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

    const PreviewNavbar = () => (
        <>
            {/* Desktop Navbar - Top */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, rgba(26, 10, 10, 0.95) 0%, rgba(45, 21, 21, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(212, 166, 141, 0.2)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
            }} className="desktop-nav">
                <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.5rem', color: '#d4a68d' }}>
                    Undangan Rabiku
                </span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a
                        href="/"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            background: 'transparent',
                            border: '1px solid rgba(212, 166, 141, 0.5)',
                            color: '#d4a68d',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        ← Kembali
                    </a>
                    <a
                        href={waLink}
                        target="_blank"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        📲 Pesan Sekarang
                    </a>
                </div>
            </nav>

            {/* Mobile Bottom Bar */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'none',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, rgba(26, 10, 10, 0.98) 0%, rgba(45, 21, 21, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(212, 166, 141, 0.2)',
                boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)',
            }} className="mobile-nav">
                <a
                    href="/"
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '50px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(212, 166, 141, 0.3)',
                        color: '#f5e6dc',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    ← Kembali
                </a>
                <a
                    href={waLink}
                    target="_blank"
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    📲 Pesan
                </a>
            </nav>

            {/* CSS for responsive display */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-nav { display: flex !important; }
                }
            `}</style>
        </>
    );

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            {showCheckout && <PreviewNavbar />}

            {/* Broadcast Bubbles - Bottom Right */}
            {currentBubble && (
                <div className={styles.broadcastContainer}>
                    <div className={styles.broadcastBubble}>
                        <strong>{currentBubble.guestName}</strong>
                        <p>{currentBubble.comment}</p>
                    </div>
                </div>
            )}

            {/* Music Player */}
            {content.music?.youtubeId && (
                <div className={styles.musicPlayer}>
                    <iframe
                        width="1" height="1"
                        src={`https://www.youtube.com/embed/${content.music.youtubeId}?autoplay=${content.music.autoPlay ? 1 : 0}&loop=1&playlist=${content.music.youtubeId}&enablejsapi=1`}
                        allow="autoplay; encrypted-media"
                        style={{ opacity: 0, position: 'absolute' }}
                    />
                    <div className={styles.musicControl}>
                        🎵 Background Music Active
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            <section className={styles.hero} style={{ backgroundImage: `url(${content.hero?.backgroundImage})` }}>
                <div className={styles.heroOverlay}>
                    <h1 className={styles.title}>{content.hero?.title}</h1>
                    <p className={styles.subtitle}>{content.hero?.subtitle}</p>

                    {/* Countdown */}
                    {content.countdown && timeLeft && (
                        <div className={styles.countdown}>
                            <div className={styles.timeBox}><span>{timeLeft.days}</span>Days</div>
                            <div className={styles.timeBox}><span>{timeLeft.hours}</span>Hrs</div>
                            <div className={styles.timeBox}><span>{timeLeft.minutes}</span>Mins</div>
                            <div className={styles.timeBox}><span>{timeLeft.seconds}</span>Secs</div>
                        </div>
                    )}
                </div>
            </section>

            {/* STORY SECTION */}
            {content.story && (
                <section className={`${styles.story} ${styles.animateSection}`}>
                    <h2 className={styles.sectionTitle}>{content.story.title}</h2>
                    <p>{content.story.text}</p>
                </section>
            )}

            {/* GALLERY SECTION */}
            {content.gallery && (
                <section className={`${styles.gallery} ${styles.animateSection}`}>
                    <h2 className={styles.sectionTitle}>{content.gallery.title}</h2>
                    <div className={styles.galleryGrid}>
                        {content.gallery.images?.map((img: string, idx: number) => (
                            <img key={idx} src={img} alt={`Gallery ${idx}`} className={styles.galleryImg} />
                        ))}
                    </div>
                </section>
            )}

            {/* EVENT SECTION (Map) */}
            {content.event && (
                <section className={`${styles.event} ${styles.animateSection}`}>
                    <div className={styles.eventDetails}>
                        <h2 className={styles.sectionTitle}>Save The Date</h2>
                        <p className={styles.eventDate}>{content.event.date} @ {content.event.time}</p>
                        <p className={styles.eventLoc}>{content.event.location}</p>
                        <p>{content.event.address}</p>
                    </div>
                    {content.event.mapEmbedUrl && (
                        <div className={styles.mapContainer}>
                            <iframe
                                src={content.event.mapEmbedUrl}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                            />
                        </div>
                    )}
                </section>
            )}

            {/* GIFT SECTION */}
            {content.gifts?.show && (
                <section className={`${styles.gifts} ${styles.animateSection}`}>
                    <h2 className={styles.sectionTitle}>Wedding Gift</h2>
                    <p>Your blessing is enough, but if you wish to give a token of appreciation:</p>
                    <div className={styles.giftGrid}>
                        {content.gifts.items?.map((item: any, idx: number) => (
                            <div key={idx} className={styles.giftCard}>
                                <h3>{item.type}: {item.name}</h3>
                                <p className={styles.accountNumber}>{item.number}</p>
                                <p className={styles.accountName}>a.n {item.accountName}</p>
                                <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(item.number)}>
                                    Copy Number
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* RSVP SECTION */}
            {content.rsvp && (
                <section className={`${styles.rsvp} ${styles.animateSection}`}>
                    <h2 className={styles.sectionTitle}>RSVP</h2>
                    <p>Please confirm your attendance by {content.rsvp.deadline}</p>

                    {rsvpStatus === 'success' ? (
                        <div className={styles.successMessage}>
                            {rsvpMessage}
                        </div>
                    ) : (
                        <form className={styles.rsvpForm} onSubmit={handleRsvpSubmit}>
                            <input type="text" name="guestName" placeholder="Your Name" required />
                            <input type="email" name="email" placeholder="Email (Optional)" />
                            <select name="attending">
                                <option>Will Attend</option>
                                <option>Sorry, Cannot Attend</option>
                            </select>
                            {content.rsvp.showAllergyField && (
                                <input type="text" name="allergies" placeholder="Food Allergies (Optional)" />
                            )}
                            <textarea
                                name="comment"
                                placeholder="Leave a message for the couple... 💕"
                                rows={3}
                                className={styles.commentInput}
                            />
                            <button type="submit" disabled={rsvpStatus === 'submitting'}>
                                {rsvpStatus === 'submitting' ? 'Sending...' : 'Send Confirmation'}
                            </button>
                            {rsvpStatus === 'error' && <p className={styles.errorText}>{rsvpMessage}</p>}
                        </form>
                    )}
                </section>
            )}

            <footer className={styles.footer}>
                <p>Made with ❤️ using Undangan Rabiku</p>
            </footer>
        </div>
    );
}
