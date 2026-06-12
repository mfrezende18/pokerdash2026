export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { ChampionCard } from "@/components/features/ChampionCard"
import { RankingList } from "@/components/features/RankingList"
import { EventsSection } from "@/components/features/EventsSection"
import { HighlightCarousel } from "@/components/features/HighlightCarousel"

async function getActiveSession() {
  const session = await prisma.session.findFirst({
    where: { status: "ACTIVE" },
    include: {
      buyIns: { include: { player: true }, orderBy: { createdAt: "asc" } },
      cashOuts: { include: { player: true } },
    },
    orderBy: { startedAt: "desc" },
  })

  if (!session) return null

  const totalPot = session.buyIns.reduce((sum, b) => sum + b.amount, 0)
  const uniquePlayers = new Set(session.buyIns.map((b) => b.playerId))
  const activePlayersIds = [...uniquePlayers].filter(
    (pid) => !session.cashOuts.some((c) => c.playerId === pid)
  )

  const activePlayersData = activePlayersIds.map((pid) => {
    const playerBuyIns = session.buyIns.filter((b) => b.playerId === pid)
    const player = playerBuyIns[0].player
    return {
      id: player.id,
      name: player.name,
      avatarUrl: player.avatarUrl,
      totalSpent: playerBuyIns.reduce((sum, b) => sum + b.amount, 0),
      rebuyCount: playerBuyIns.length - 1,
      joinedAt: playerBuyIns[0].createdAt,
    }
  })

  // Build the action console events
  const allEvents: Array<{ id: string; message: string; timestamp: Date }> = []
  const rebuyCounts: Record<string, number> = {}

  for (const b of session.buyIns) {
    if (b.type === "INITIAL") {
      allEvents.push({
        id: b.id,
        timestamp: b.createdAt,
        message: `${b.player.name} entrou no jogo: buy-in ${formatCurrency(b.amount)}`,
      })
    } else {
      rebuyCounts[b.playerId] = (rebuyCounts[b.playerId] || 0) + 1
      const count = rebuyCounts[b.playerId]
      if (count === 1) {
        allEvents.push({
          id: b.id,
          timestamp: b.createdAt,
          message: `re-buy para o ${b.player.name} ${formatCurrency(b.amount)}`,
        })
      } else {
        allEvents.push({
          id: b.id,
          timestamp: b.createdAt,
          message: `${count}º re-buy ${b.player.name} ${formatCurrency(b.amount)}`,
        })
      }
    }
  }

  for (const c of session.cashOuts) {
    allEvents.push({
      id: c.id,
      timestamp: c.createdAt,
      message: `${c.player.name} fez cash-out de ${formatCurrency(c.chipValue)}`,
    })
  }

  allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return {
    ...session,
    totalPot,
    playerCount: activePlayersIds.length,
    activePlayersData,
    events: allEvents,
  }
}

async function getAllPlayers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  })
}

async function getLastChampion() {
  const lastClosedSession = await prisma.session.findFirst({
    where: { status: "CLOSED" },
    orderBy: { closedAt: "desc" },
    include: {
      cashOuts: {
        include: { player: true },
        orderBy: { netResult: "desc" },
        take: 1,
      },
    },
  })

  if (!lastClosedSession || lastClosedSession.cashOuts.length === 0) return null

  const winner = lastClosedSession.cashOuts[0]
  return {
    name: winner.player.name,
    avatarUrl: winner.player.avatarUrl,
    sessionName: lastClosedSession.name,
    netResult: winner.netResult,
  }
}

async function getLastSessionRankings() {
  const lastClosedSession = await prisma.session.findFirst({
    where: { status: "CLOSED" },
    orderBy: { closedAt: "desc" },
    include: {
      cashOuts: {
        include: { player: true },
        orderBy: { netResult: "desc" },
      },
    },
  })

  if (!lastClosedSession) return []

  return lastClosedSession.cashOuts.map((cashOut) => ({
    id: cashOut.player.id,
    name: cashOut.player.name,
    avatarUrl: cashOut.player.avatarUrl,
    netResult: cashOut.netResult,
  }))
}

async function getEvents() {
  return prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
    take: 4,
  })
}

async function getHighlights() {
  return prisma.highlight.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}

import { InteractiveTable } from "@/components/features/InteractiveTable"
import { SessionLogConsole } from "@/components/features/SessionLogConsole"
import { getAuthSession } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

export default async function HomePage() {
  const [activeSession, champion, rankings, events, highlights, allUsers, sessionUser] =
    await Promise.all([
      getActiveSession(),
      getLastChampion(),
      getLastSessionRankings(),
      getEvents(),
      getHighlights(),
      getAllPlayers(),
      getAuthSession()
    ])

  const isAdmin = sessionUser?.role === "ADMIN1" || sessionUser?.role === "ADMIN2"

  return (
    <>
      <TopAppBar
        avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC8UjX_u8I__Bh7iB_7uIBx856qATLZSDXJ12WmqaNeZKT80zYOJIGNll8-OJCheb_ExmJ5EKA_zyEXK666x7DEkSdB0smXqXX6o_mfBzuwlKb9pJOTx-5Pr3udJoyM8Nfzr0WVN4pu7INhyYS6NdPKLkszxGzEywPFNTgbj_Dq-tHFSpDERzo8-QgvyF64HtshfawhInRvqYoUHQcGSrZWMVggQssir_z6gScrLQSo79XJ-tLUgYkoqp95FFbHS8vOGeOFIXXK_QM"
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-10 space-y-10">
        {/* Mesa Interativa */}
        {activeSession ? (
          <div className="flex flex-col">
            <InteractiveTable
              sessionInfo={{
                id: activeSession.id,
                name: activeSession.name,
                totalPot: activeSession.totalPot,
                playerCount: activeSession.playerCount,
                startedAt: activeSession.startedAt,
              }}
              activePlayers={activeSession.activePlayersData}
              allUsers={allUsers}
              isAdmin={isAdmin}
            />
            <div className="mt-6">
              <SessionLogConsole events={activeSession.events} />
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-surface-variant/20 apple-shadow">
            <h2 className="text-headline-sm text-primary mb-2">Nenhuma mesa rolando</h2>
            <p className="text-secondary mb-6">Inicie uma sessão para começar o jogo.</p>
            {/* Aqui poderia entrar um botão de "Nova Sessão" se for admin */}
          </div>
        )}

        {/* Bento Grid: Campeão + Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Último Campeão */}
          <div className="md:col-span-4">
            <ChampionCard champion={champion} />
          </div>

          {/* Ranking Global */}
          <div className="md:col-span-8">
            <RankingList rankings={rankings} />
          </div>
        </div>

        {/* Próximos Eventos */}
        {events.length > 0 && <EventsSection events={events} />}

        {/* Destaques Carousel */}
        {highlights.length > 0 && (
          <HighlightCarousel highlights={highlights} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar role={sessionUser?.role} />
    </>
  )
}
