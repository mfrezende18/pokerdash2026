import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const players = [
    { name: 'Ronaldo', phone: '19984000782' },
    { name: 'MF', phone: '19983839306' }
  ]

  for (const p of players) {
    const existing = await prisma.user.findUnique({ where: { phone: p.phone } })
    if (existing) {
      console.log(`User ${p.name} (${p.phone}) already exists. Updating to require password change.`)
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(p.phone, salt)
      
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          requirePasswordChange: true
        }
      })
      console.log(`User ${p.name} updated.`)
    } else {
      console.log(`Creating user ${p.name} (${p.phone})...`)
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(p.phone, salt)
      
      await prisma.user.create({
        data: {
          name: p.name,
          phone: p.phone,
          passwordHash,
          requirePasswordChange: true,
          role: 'PLAYER'
        }
      })
      console.log(`User ${p.name} created.`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
