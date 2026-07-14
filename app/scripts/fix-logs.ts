import { prisma } from "../src/lib/db"
import { buildSessionEvents } from "../src/components/features/SessionLogConsole"

async function main() {
  const closedSessions = await prisma.session.findMany({
    where: { status: "CLOSED" },
    include: {
      buyIns: { include: { player: true } },
      cashOuts: { include: { player: true } }
    },
    orderBy: { closedAt: "desc" }
  })

  for (const session of closedSessions) {
    if (!session.systemLog) {
      const events = buildSessionEvents(session)
      await prisma.session.update({
        where: { id: session.id },
        data: { systemLog: JSON.stringify(events) }
      })
      console.log(`Updated logs for session ${session.name}`)
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
