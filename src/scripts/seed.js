require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')

// Hardcode path to prisma/dev.db relative to CWD to ensure correct runtime resolution
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const url = `file:${dbPath}`

console.log('Connecting to:', url)

const prisma = new PrismaClient({
    datasourceUrl: url,
})

async function main() {
    console.log('Seeding...')
    const password = await bcrypt.hash('admin123', 10)
    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password,
            role: 'ADMIN',
        },
    })
    console.log('Seeded:', user)
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
