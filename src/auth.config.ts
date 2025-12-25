import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                if (isLoggedIn) return true;

                // Force absolute URL for callback to avoid localhost loop on VPS
                const callbackBase = process.env.AUTH_URL ?? nextUrl.origin;
                const callbackUrl = `${callbackBase}${nextUrl.pathname}`;

                const loginUrl = new URL('/login', nextUrl);
                loginUrl.searchParams.set('callbackUrl', callbackUrl);

                return Response.redirect(loginUrl);
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                // @ts-ignore
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        }
    },
    providers: [],
    session: { strategy: "jwt" },
} satisfies NextAuthConfig;
