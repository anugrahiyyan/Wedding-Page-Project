import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authHandler = NextAuth(authConfig).auth;

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Define known main domains (without subdomains)
    const knownDomains = [
        'localhost:3000',
        'localhost',
        '127.0.0.1:3000',
        '127.0.0.1',
        'invitationwedding.my.id',
        'www.invitationwedding.my.id',
    ];

    // Check if current hostname is NOT a known main domain (i.e., it has a subdomain)
    let subdomain: string | null = null;

    // Check for localhost subdomains (e.g., john-jane.localhost:3000)
    if (hostname.includes('.localhost') || hostname.includes('.127.0.0.1')) {
        const parts = hostname.split('.');
        if (parts[0] && parts[0] !== 'www') {
            subdomain = parts[0];
        }
    }
    // Check for production subdomains (e.g., john-jane.invitationwedding.my.id)
    else if (hostname.endsWith('.invitationwedding.my.id')) {
        const parts = hostname.replace('.invitationwedding.my.id', '');
        if (parts && parts !== 'www') {
            subdomain = parts;
        }
    }

    // If subdomain found, rewrite to /s/[subdomain]
    if (subdomain) {
        console.log(`[Middleware] Subdomain detected: ${subdomain}, rewriting to /s/${subdomain}`);
        return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
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
