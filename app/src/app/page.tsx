export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { ChampionCard } from "@/components/features/ChampionCard"
import { RankingList } from "@/components/features/RankingList"
import { EventsSection } from "@/components/features/EventsSection"
import { HighlightCarousel } from "@/components/features/HighlightCarousel"
import { InteractiveTable } from "@/components/features/InteractiveTable"
import { SessionLogConsole } from "@/components/features/SessionLogConsole"
import { getAuthSession } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { EmptyTableState } from "@/components/features/EmptyTableState"
import { computePlayerBadges } from "@/lib/ranking-utils"

async function getActiveSession() {
  const session = await prisma.session.findFirst({
    where: { status: "ACTIVE" },
    include: {
      buyIns: { 
        include: { player: { select: { id: true, name: true, avatarUrl: true } } }, 
        orderBy: { createdAt: "asc" } 
      },
      cashOuts: { 
        include: { player: { select: { id: true, name: true, avatarUrl: true } } } 
      },
    },
    orderBy: { startedAt: "desc" },
  })

  if (!session) return null

  const totalPot = session.buyIns.filter(b => b.status === "APPROVED").reduce((sum, b) => sum + b.amount, 0)
  const uniquePlayers = new Set(session.buyIns.map((b) => b.playerId))
  const activePlayersIds = [...uniquePlayers].filter(
    (pid) => !session.cashOuts.some((c) => c.playerId === pid)
  )

  const activePlayersData = activePlayersIds.map((pid) => {
    const allPlayerBuyIns = session.buyIns.filter((b) => b.playerId === pid)
    const approvedBuyIns = allPlayerBuyIns.filter(b => b.status === "APPROVED")
    const pendingBuyIn = allPlayerBuyIns.find(b => b.status === "PENDING")
    
    // Default to the first buy in we found if no approved exist yet (for edge cases)
    const player = allPlayerBuyIns[0].player
    return {
      id: player.id,
      name: player.name,
      avatarUrl: player.avatarUrl,
      totalSpent: approvedBuyIns.reduce((sum, b) => sum + b.amount, 0),
      rebuyCount: approvedBuyIns.filter(b => b.type === "REBUY").length,
      joinedAt: allPlayerBuyIns[0].createdAt,
      isPendingRebuy: !!pendingBuyIn,
      pendingRebuyAmount: pendingBuyIn ? pendingBuyIn.amount : null,
      pendingRebuyId: pendingBuyIn ? pendingBuyIn.id : null,
    }
  })

  // Build the action console events
  const allEvents: Array<{ id: string; message: string; timestamp: Date }> = []
  const rebuyCounts: Record<string, number> = {}

  for (const b of session.buyIns) {
    if (b.status === "PENDING") {
      allEvents.push({
        id: b.id + "-pending",
        timestamp: b.createdAt,
        message: `${b.player.name} solicitou re-buy de ${formatCurrency(b.amount)}`,
      })
      continue
    }
    
    if (b.status === "REJECTED") {
      allEvents.push({
        id: b.id + "-rejected",
        timestamp: b.updatedAt,
        message: `❌ Solicitação de re-buy de ${b.player.name} foi recusada`,
      })
      continue
    }

    if (b.type === "INITIAL") {
      allEvents.push({
        id: b.id,
        timestamp: b.createdAt,
        message: `${b.player.name} entrou no jogo: buy-in ${formatCurrency(b.amount)}`,
      })
    } else {
      // It's APPROVED
      const isRequested = Math.abs(b.updatedAt.getTime() - b.createdAt.getTime()) > 1000
      
      if (isRequested) {
        allEvents.push({
          id: b.id + "-pending-history",
          timestamp: b.createdAt,
          message: `${b.player.name} solicitou re-buy de ${formatCurrency(b.amount)}`,
        })
      }
      rebuyCounts[b.playerId] = (rebuyCounts[b.playerId] || 0) + 1
      const count = rebuyCounts[b.playerId]
      if (count === 1) {
        allEvents.push({
          id: b.id,
          timestamp: b.updatedAt,
          message: `✅ re-buy para o ${b.player.name} ${formatCurrency(b.amount)}`,
        })
      } else {
        allEvents.push({
          id: b.id,
          timestamp: b.updatedAt,
          message: `✅ ${count}º re-buy ${b.player.name} ${formatCurrency(b.amount)}`,
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

const getAllPlayersCached = unstable_cache(
  async () => {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        avatarUrl: true,
        _count: {
          select: { buyIns: true }
        }
      },
    })
    
    return users.sort((a, b) => {
      const aGames = a._count.buyIns
      const bGames = b._count.buyIns
      if (bGames !== aGames) return bGames - aGames
      return a.name.localeCompare(b.name)
    }).map(({ _count, ...rest }) => rest)
  },
  ['all-players'],
  { revalidate: 3600, tags: ['players'] }
)

const getLastChampionCached = unstable_cache(
  async () => {
    const lastClosedSession = await prisma.session.findFirst({
      where: { status: "CLOSED" },
      orderBy: { closedAt: "desc" },
      include: {
        cashOuts: {
          include: { player: { select: { name: true, avatarUrl: true } } },
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
  },
  ['last-champion'],
  { revalidate: 60, tags: ['sessions'] }
)

const getLastSessionRankingsCached = unstable_cache(
  async () => {
    const [lastClosedSession, closedSessions] = await Promise.all([
      prisma.session.findFirst({
        where: { status: "CLOSED" },
        orderBy: { closedAt: "desc" },
        include: {
          cashOuts: {
            include: { player: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { netResult: "desc" },
          },
        },
      }),
      prisma.session.findMany({
        where: { status: "CLOSED" },
        orderBy: { closedAt: "desc" },
        select: {
          id: true,
          closedAt: true,
          buyIns: { select: { playerId: true } },
          cashOuts: { select: { playerId: true, netResult: true } },
        },
      }),
    ])
    if (!lastClosedSession) return []

    const playerIds = lastClosedSession.cashOuts.map(c => c.player.id)
    const badgeMap = computePlayerBadges(closedSessions, playerIds)

    return lastClosedSession.cashOuts.map((cashOut) => {
      const bd = badgeMap.get(cashOut.player.id)
      return {
        id: cashOut.player.id,
        name: cashOut.player.name,
        avatarUrl: cashOut.player.avatarUrl,
        netResult: cashOut.netResult,
        badge: bd?.badge ?? null,
        streakCount: bd?.streakCount ?? 0,
        positionDelta: bd?.positionDelta ?? null,
      }
    })
  },
  ['last-rankings'],
  { revalidate: 60, tags: ['sessions'] }
)

const getEventsCached = unstable_cache(
  async () => {
    return prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 4,
    })
  },
  ['events'],
  { revalidate: 3600, tags: ['events'] }
)

const getHighlightsCached = unstable_cache(
  async () => {
    return prisma.highlight.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    })
  },
  ['highlights'],
  { revalidate: 3600, tags: ['highlights'] }
)


async function ActiveTableArea({ sessionUser, allUsers }: { sessionUser: any, allUsers: any[] }) {
  const activeSession = await getActiveSession()
  const isAdmin = sessionUser?.role === "ADMIN1" || sessionUser?.role === "ADMIN2" || sessionUser?.role === "ADMIN3"

  if (activeSession) {
    return (
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
    )
  }

  return <EmptyTableState isAdmin={isAdmin} />
}

async function CachedContentArea({ activeSessionPromise }: { activeSessionPromise: Promise<any> }) {
  const [activeSession, champion, rankings, events, highlights] = await Promise.all([
    activeSessionPromise,
    getLastChampionCached(),
    getLastSessionRankingsCached(),
    getEventsCached(),
    getHighlightsCached(),
  ])

  return (
    <>
      {events.length > 0 && (
        <div className="mt-6">
          <EventsSection events={events} />
        </div>
      )}

      {!activeSession && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-4">
            <ChampionCard champion={champion} />
          </div>
          <div className="md:col-span-8">
            <RankingList rankings={rankings} />
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <HighlightCarousel highlights={highlights} />
      )}
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="h-[400px] bg-surface-container-high rounded-3xl"></div>
    </div>
  )
}

export default async function HomePage() {
  const sessionUser = await getAuthSession()
  const allUsers = await getAllPlayersCached()
  const activeSessionPromise = getActiveSession() // Initiate request early

  return (
    <>
      <TopAppBar
        avatarUrl={sessionUser?.avatarUrl ?? undefined}
      />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-10 space-y-10 mb-24">
        <Suspense fallback={<TableSkeleton />}>
          <ActiveTableArea sessionUser={sessionUser} allUsers={allUsers.map(u => ({ id: u.id, name: u.name }))} />
        </Suspense>

        <Suspense fallback={null}>
          <CachedContentArea activeSessionPromise={activeSessionPromise} />
        </Suspense>
      </main>

      <BottomNavBar role={sessionUser?.role} />
    </>
  )
}
