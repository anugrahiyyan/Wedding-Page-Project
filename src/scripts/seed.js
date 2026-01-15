require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')

console.log('Seeding database...')

const prisma = new PrismaClient()

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
