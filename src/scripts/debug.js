require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

console.log('DB URL:', process.env.DATABASE_URL)

try {
    const prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL
    })
    prisma.user.count()
        .then(count => {
            console.log('User count:', count)
            return prisma.$disconnect()
        })
        .catch(e => {
            console.error('Prisma Error:', e)
            prisma.$disconnect()
        })
} catch (e) {
    console.error('Constructor Error:', e)
}
