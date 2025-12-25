import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('Authorizing credentials:', credentials?.username);
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const user = await db.user.findUnique({ where: { username } });
                    console.log('User found:', !!user);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log('Password match:', passwordsMatch);
                    if (passwordsMatch) return user;
                }
                console.log('Authorization failed');
                return null;
            },
        }),
    ],
})
