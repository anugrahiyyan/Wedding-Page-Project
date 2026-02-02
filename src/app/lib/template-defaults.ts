// Template defaults - shared constants for VFS initialization
// This file has no directive so it can be imported by both server and client code

import { VirtualFile } from '@/types/virtual-file';

// Default wedding template split into HTML, CSS, and JS
// This is the single source of truth for new templates
export const DEFAULT_FILES: VirtualFile[] = [
    {
        id: 'root-index',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Wedding of Jane & John</title>
    <link rel="stylesheet" href="style.css">
    <!-- Font for elegant titles -->
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
</head>
<body>
    <!-- BUBBLE ANIMATION CONTAINER (pointer-events: none to not block forms) -->
    <div class="bubble-container" id="bubbles"></div>

    <!-- HERO SECTION -->
    <header class="hero">
        <h1>Jane & John</h1>
        <p>Are getting married!</p>
        <p>December 25, 2025</p>
    </header>

    <!-- GUEST GREETING (Shows personalized name from URL) -->
    <section class="greeting-section">
        <p class="greeting-label">Dear</p>
        <h2 class="guest-name" id="guest-display">Honored Guest</h2>
        <p class="greeting-sub">You are cordially invited to celebrate our special day</p>
    </section>

    <!-- STORY SECTION -->
    <section>
        <h2>Our Story</h2>
        <p>We met at a coffee shop on a rainy Tuesday. One cup of latte later, we knew it was forever. Join us as we celebrate our love.</p>
    </section>

    <!-- RSVP SECTION (CRITICAL: DO NOT REMOVE ID="rsvp-form") -->
    <section>
        <div class="rsvp-container">
            <h2>RSVP</h2>
            <p>Please confirm your attendance by Dec 1, 2025</p>
            
            <form id="rsvp-form" method="POST" onsubmit="return typeof window.submitRsvpForm === 'function' ? window.submitRsvpForm(event) : true">
                <!-- Hidden Subdomain Field (Filled automatically by TemplateRenderer) -->
                <input type="hidden" name="subdomain" id="subdomain-field">
                
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" name="guestName" id="guest-name-input" required placeholder="Enter full name">
                </div>
                
                <div class="form-group">
                    <label>Email (Optional)</label>
                    <input type="email" name="email" placeholder="For updates">
                </div>

                <div class="form-group">
                    <label>Will you attend?</label>
                    <select name="attending">
                        <option value="true">Yes, I will be there!</option>
                        <option value="false">Sorry, I can't come</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Message for the couple</label>
                    <textarea name="comment" rows="3" placeholder="Write your wishes..."></textarea>
                </div>

                <button type="submit" id="submit-btn">Send Confirmation</button>
                <div id="rsvp-message"></div>
            </form>
        </div>
    </section>

    <script src="script.js"></script>
</body>
</html>`
    },
    {
        id: 'root-style',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `/* BASE STYLES */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #fdf6f0;
    color: #4a4a4a;
    line-height: 1.6;
    position: relative;
    overflow-x: hidden;
}
section { padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; text-align: center; }

/* HERO */
.hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    color: white;
    position: relative;
    z-index: 1;
}
.hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-family: 'Great Vibes', cursive; }
.hero p { font-size: 1.5rem; font-weight: 300; }

/* GUEST GREETING */
.greeting-section {
    background: linear-gradient(135deg, #fff5f5 0%, #fdf6f0 100%);
    padding: 3rem 2rem;
}
.greeting-label {
    font-size: 1.2rem;
    color: #888;
    margin-bottom: 0.5rem;
}
.guest-name {
    font-family: 'Great Vibes', cursive;
    font-size: 3rem;
    color: #d4a68d;
    margin-bottom: 0.5rem;
}
.greeting-sub {
    font-size: 1rem;
    color: #666;
    font-style: italic;
}

/* BUBBLE ANIMATION - IMPORTANT: pointer-events: none so it doesn't block forms */
.bubble-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* CRITICAL: Allows clicking through bubbles */
    z-index: 0;
    overflow: hidden;
}
.bubble {
    position: absolute;
    bottom: -100px;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(212,166,141,0.3));
    border-radius: 50%;
    animation: float-up 8s ease-in infinite;
    pointer-events: none; /* Extra safety */
}
@keyframes float-up {
    0% { transform: translateY(0) scale(1); opacity: 0.7; }
    50% { opacity: 0.5; }
    100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
}

/* RSVP FORM - Ensure it's above bubbles */
.rsvp-container {
    background: white;
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    margin-top: 3rem;
    position: relative;
    z-index: 10; /* Above bubbles */
}
.form-group { margin-bottom: 1.5rem; text-align: left; }
label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
input, select, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    position: relative;
    z-index: 11; /* Ensure inputs are clickable */
}
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #d4a68d;
    box-shadow: 0 0 0 3px rgba(212,166,141,0.2);
}
button[type="submit"] {
    background: #d4a68d;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 30px;
    cursor: pointer;
    transition: background 0.3s;
    width: 100%;
    position: relative;
    z-index: 11;
}
button[type="submit"]:hover { background: #c08e72; }
#rsvp-message { margin-top: 1rem; font-weight: bold; }
.success { color: green; }
.error { color: red; }`
    },
    {
        id: 'root-script',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// Guest Name Display & RSVP Initialization
// Uses a flag to prevent duplicate execution
(function() {
    // Guard against multiple executions
    if (window.__templateInitialized) return;
    window.__templateInitialized = true;
    
    function initTemplate() {
        // 1. Parse guest name from URL (e.g., ?to=Ahmad%20%26%20Yanti or /guest/ahmad-yanti)
        const urlParams = new URLSearchParams(window.location.search);
        let guestName = urlParams.get('to') || urlParams.get('guest');
        
        // Also check path-based guest name (e.g., /s/subdomain/guest/ahmad-yanti)
        if (!guestName) {
            const pathMatch = window.location.pathname.match(/\\/guest\\/([^/]+)/);
            if (pathMatch) {
                guestName = decodeURIComponent(pathMatch[1]).replace(/-/g, ' ');
            }
        }
        
        // Display guest name if found
        if (guestName) {
            const displayEl = document.getElementById('guest-display');
            const inputEl = document.getElementById('guest-name-input');
            if (displayEl) {
                displayEl.textContent = decodeURIComponent(guestName);
            }
            // Pre-fill the RSVP name field ONLY if empty (don't overwrite user typing!)
            if (inputEl && !inputEl.value) {
                inputEl.value = decodeURIComponent(guestName);
            }
        }
        
        // 2. Fill subdomain field for RSVP
        const hiddenField = document.getElementById('subdomain-field');
        if (hiddenField && !hiddenField.value) {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const sIndex = pathParts.indexOf('s');
            if (sIndex !== -1 && pathParts[sIndex + 1]) {
                hiddenField.value = pathParts[sIndex + 1];
            } else {
                const hostParts = window.location.hostname.split('.');
                if (hostParts.length >= 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
                    hiddenField.value = hostParts[0];
                }
            }
        }
        
        // 3. Create bubble animation (only once)
        createBubbles();
    }
    
    function createBubbles() {
        const container = document.getElementById('bubbles');
        if (!container) return;
        
        // Guard: Don't create if bubbles already exist
        if (container.children.length > 0) return;
        
        // Create 15 bubbles with random properties
        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.width = bubble.style.height = (Math.random() * 60 + 20) + 'px';
            bubble.style.animationDelay = (Math.random() * 5) + 's';
            bubble.style.animationDuration = (Math.random() * 5 + 5) + 's';
            container.appendChild(bubble);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplate);
    } else {
        initTemplate();
    }
})();`
    }
];
