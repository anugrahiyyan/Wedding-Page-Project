import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authHandler = NextAuth(authConfig).auth;

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Check if current hostname is NOT a known main domain (i.e., it has a subdomain)
    let subdomain: string | null = null;

    // Check for production subdomains
    const rootDomain = process.env.ROOT_DOMAIN;
    if (rootDomain && hostname.endsWith(rootDomain)) {
        const parts = hostname.replace(`.${rootDomain}`, '');
        if (parts && parts !== 'www' && parts !== rootDomain) {
            subdomain = parts;
        }
    }

    // If subdomain found, rewrite to /s/[subdomain] preserving the path and query params
    if (subdomain) {
        const path = url.pathname; // e.g., /rsvp or empty
        const search = url.search; // e.g., ?token=123456
        const rewritePath = `/s/${subdomain}${path}${search}`;
        console.log(`[Middleware] Subdomain detected: ${subdomain}, rewriting to ${rewritePath}`);
        return NextResponse.rewrite(new URL(rewritePath, request.url));
    }

    // Run Auth Middleware for Dashboard routes
    if (url.pathname.startsWith('/dashboard')) {
        return authHandler(request as any);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
