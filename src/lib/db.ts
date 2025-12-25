import { PrismaClient } from '@prisma/client'
import path from 'path'

const prismaClientSingleton = () => {
    // Explicitly set the path to the database file to avoid relative path issues
    // between `prisma db push` (relative to schema) and runtime (relative to CWD).
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    return new PrismaClient({
        datasources: {
            db: {
                url: `file:${dbPath}`,
            },
        },
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
