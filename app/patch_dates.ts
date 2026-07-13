import { prisma } from "./src/lib/db"

async function main() {
  const sessions = await prisma.session.findMany()
  
  for (const session of sessions) {
    const match = session.name.match(/(\d{2})\/(\d{2})\/?(\d{2,4})?/)
    if (match) {
      const day = parseInt(match[1])
      const month = parseInt(match[2]) - 1 // 0-indexed
      let year = match[3] ? parseInt(match[3]) : new Date().getFullYear()
      if (year < 2000) year += 2000 // Convert 26 to 2026
      
      const date = new Date(year, month, day, 23, 59, 59) // End of day
      
      await prisma.session.update({
        where: { id: session.id },
        data: {
          startedAt: new Date(year, month, day, 18, 0, 0),
          closedAt: date
        }
      })
      console.log(`Updated ${session.name} -> ${date.toISOString()}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
