import { NextRequest } from 'next/server';

/**
 * CSRF Protection Utility
 * Validates that requests come from trusted origins.
 * 
 * For Cloudflare Tunnel: Add your tunnel domain to ROOT_DOMAIN in .env
 * e.g., ROOT_DOMAIN="your-wedding.trycloudflare.com"
 */

// Get allowed origins from environment
function getAllowedOrigins(): string[] {
    const origins: string[] = [];
    const rootDomain = process.env.ROOT_DOMAIN;
    const authUrl = process.env.AUTH_URL;

    // Always allow localhost for development
    origins.push('http://localhost:3000');
    origins.push('https://localhost:3000');

    // Add ROOT_DOMAIN variations
    if (rootDomain) {
        // Support both with and without port
        const cleanDomain = rootDomain.replace(/:\d+$/, ''); // Remove port if present
        origins.push(`http://${rootDomain}`);
        origins.push(`https://${rootDomain}`);
        origins.push(`http://${cleanDomain}`);
        origins.push(`https://${cleanDomain}`);

        // Support subdomains (for wildcard subdomain mode)
        // e.g., *.your-domain.com
        origins.push(`*.${cleanDomain}`);
    }

    // Add AUTH_URL if set (used by NextAuth)
    if (authUrl) {
        origins.push(authUrl);
    }

    return origins;
}

/**
 * Validates the Origin or Referer header against allowed origins.
 * Returns true if the request is from a trusted origin.
 */
export function validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') || '';

    // Get the origin to check
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    // If no origin/referer, could be same-origin request or server-to-server
    // Be permissive for GET/HEAD (safe methods), strict for state-changing methods
    if (!requestOrigin) {
        const method = request.method.toUpperCase();
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return true; // Safe methods don't need CSRF protection
        }
        // For POST/PUT/DELETE without origin, check if it's same-host
        // This could be a form submission from the same domain
        return false; // Reject state-changing requests without origin
    }

    const allowedOrigins = getAllowedOrigins();

    // Direct match
    if (allowedOrigins.includes(requestOrigin)) {
        return true;
    }

    // Wildcard subdomain match
    try {
        const originUrl = new URL(requestOrigin);
        const originHost = originUrl.host;

        for (const allowed of allowedOrigins) {
            if (allowed.startsWith('*.')) {
                const baseDomain = allowed.slice(2); // Remove "*."
                if (originHost === baseDomain || originHost.endsWith(`.${baseDomain}`)) {
                    return true;
                }
            }
        }

        // Check if origin matches current host (same-origin)
        if (originHost === host || originHost === host.split(':')[0]) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
}

/**
 * Creates a CSRF error response
 */
export function csrfErrorResponse() {
    return new Response(JSON.stringify({
        success: false,
        error: 'CSRF validation failed: Invalid origin'
    }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Middleware-style CSRF check.
 * Returns null if valid, or an error Response if invalid.
 */
export function checkCsrf(request: NextRequest): Response | null {
    if (!validateOrigin(request)) {
        console.warn(`[CSRF] Blocked request from origin: ${request.headers.get('origin') || 'unknown'}`);
        return csrfErrorResponse();
    }
    return null;
}
