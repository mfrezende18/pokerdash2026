import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const prisma = new PrismaClient()

async function test() {
  try {
    const phone = "19983839306"
    console.log("Finding user...")
    const user = await prisma.user.findUnique({ where: { phone } })
    console.log("User:", user)
    
    if (user && user.passwordHash) {
      console.log("Comparing password...")
      const isValid = await bcrypt.compare("123456", user.passwordHash)
      console.log("Valid:", isValid)
    }
  } catch (e) {
    console.error("Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

test()
