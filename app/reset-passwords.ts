import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('mudar123', 10)
  
  const result = await prisma.user.updateMany({
    where: {
      name: { not: 'MF' }
    },
    data: {
      passwordHash: passwordHash,
      requirePasswordChange: true
    }
  })
  console.log(`Updated ${result.count} users with password 'mudar123'.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
