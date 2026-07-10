import { PrismaClient } from './node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRaw`ALTER PUBLICATION supabase_realtime ADD TABLE "Session", "BuyIn", "CashOut";`
    console.log("Realtime enabled successfully.")
  } catch (e) {
    console.error("Failed to enable realtime. Maybe it's already enabled or publication doesn't exist.", e)
  }
}
main().finally(() => prisma.$disconnect())
