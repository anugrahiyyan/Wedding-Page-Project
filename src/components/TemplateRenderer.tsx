'use client';

import { useState, useEffect } from 'react';
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
    initialWishes = []
}: {
    content: any,
    showCheckout?: boolean,
    templateName?: string,
    subdomain?: string,
    initialWishes?: WishMessage[]
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

    // --- State for Countdown ---
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
    };

    if (!isClient) return <div className={styles.wrapper} style={{ minHeight: '100vh' }}></div>;

    const FloatingCheckout = () => (
        <a
            href={`https://wa.me/6281230826731?text=Hi,%20I%20want%20to%20buy%20template:%20${encodeURIComponent(templateName)}`}
            target="_blank"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                zIndex: 1000,
                background: '#25D366',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '2px solid white'
            }}
        >
            <span>🛍️ Buy This Template</span>
        </a>
    );

    return (
        <div className={styles.wrapper}>
            {showCheckout && <FloatingCheckout />}

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
                <p>Made with ❤️ using WeddingAdmin</p>
            </footer>
        </div>
    );
}
