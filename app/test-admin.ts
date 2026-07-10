import { prisma } from "./src/lib/db"

async function getAdminData() {
  const activeSession = await prisma.session.findFirst({
    where: { status: "ACTIVE" },
    include: {
      buyIns: { 
        include: { 
          player: { select: { id: true, name: true, avatarUrl: true } }
        } 
      },
      cashOuts: { 
        include: { 
          player: { select: { id: true, name: true, avatarUrl: true } }
        } 
      },
    },
    orderBy: { startedAt: "desc" },
  })

  const totalPot = activeSession
    ? activeSession.buyIns.reduce((sum, b) => sum + b.amount, 0)
    : 0

  let totalRake = 0
  if (activeSession) {
    if (activeSession.rakeType === "PERCENT") {
      totalRake = totalPot * (activeSession.rakePercent / 100)
    } else if (activeSession.rakeType === "FIXED") {
      totalRake = activeSession.rakeFixed
    }
  }

  // Get player summaries for active session
  const playerSummaries: Array<any> = []

  if (activeSession) {
    const playerIds = [...new Set(activeSession.buyIns.map((b) => b.playerId))]

    for (const pid of playerIds) {
      const playerBuyIns = activeSession.buyIns.filter((b) => b.playerId === pid)
      const playerCashOut = activeSession.cashOuts.find((c) => c.playerId === pid)
      const player = playerBuyIns[0].player

      playerSummaries.push({
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        totalBuyIn: playerBuyIns.reduce((sum, b) => sum + b.amount, 0),
        rebuys: playerBuyIns.filter((b) => b.type === "REBUY").length,
        cashOutValue: playerCashOut?.chipValue ?? null,
        netResult: playerCashOut?.netResult ?? null,
        isActive: !playerCashOut,
      })
    }
  }

  return { activeSession, totalPot, playerSummaries }
}

async function main() {
  try {
    const data = await getAdminData()
    console.log("Success:", !!data)
  } catch (e) {
    console.error("Error in getAdminData:", e)
  }
}

main().catch(console.error)
