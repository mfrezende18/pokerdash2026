import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { PlayerCashWidget } from "@/components/features/PlayerCashWidget"

export async function PlayerCashWidgetServer() {
  const session = await getAuthSession()
  if (!session) return null

  // Check for active table
  const activeSession = await prisma.session.findFirst({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      buyIns: {
        where: { playerId: session.id },
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      cashOuts: {
        where: { playerId: session.id },
        select: { id: true },
      },
    },
  })

  if (!activeSession) return null

  // Player must have buy-ins and NOT have cashed out yet
  if (activeSession.buyIns.length === 0) return null
  if (activeSession.cashOuts.length > 0) return null

  const transactions = activeSession.buyIns.map((b) => ({
    id: b.id,
    type: b.type === "INITIAL" ? ("buyin" as const) : ("rebuy" as const),
    amount: b.amount,
    timestamp: b.createdAt,
  }))

  return (
    <PlayerCashWidget
      transactions={transactions}
      sessionName={activeSession.name}
    />
  )
}
