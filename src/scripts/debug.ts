import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

// @ts-ignore
console.log('Current Directory:', process.cwd())
// @ts-ignore
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED')
if (process.env.DATABASE_URL) {
    // @ts-ignore
    console.log('DATABASE_URL value:', process.env.DATABASE_URL)
}

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
    console.log('Connecting to Prisma...')
    try {
        const count = await prisma.user.count()
        console.log('User count:', count)
    } catch (e) {
        console.error('Connection failed:', e)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
