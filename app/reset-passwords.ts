import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  const defaultPassword = await bcrypt.hash("123456", 10)
  
  for (const user of users) {
    if (user.name !== "MF" && user.name !== "Admin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          passwordHash: defaultPassword,
          requirePasswordChange: true 
        }
      })
      console.log(`Reset password for: ${user.name}`)
    }
  }
  console.log("Done resetting passwords.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
