import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({ select: { name: true, requirePasswordChange: true } })
  console.log(users)
}
main().catch(console.error).finally(() => prisma.$disconnect())
