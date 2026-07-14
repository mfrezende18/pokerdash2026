export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { ChampionCard } from "@/components/features/ChampionCard"
import { RankingList } from "@/components/features/RankingList"
import { EventsSection } from "@/components/features/EventsSection"
import { HighlightCarousel } from "@/components/features/HighlightCarousel"
import { InteractiveTable } from "@/components/features/InteractiveTable"
import { SessionLogConsole, buildSessionEvents } from "@/components/features/SessionLogConsole"
import { getAuthSession } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { EmptyTableState } from "@/components/features/EmptyTableState"
import { computePlayerBadges } from "@/lib/ranking-utils"

const getActiveSessionCached = unstable_cache(
  async () => {
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

    const totalPot = session.buyIns.filter((b: any) => b.status === "APPROVED").reduce((sum: number, b: any) => sum + b.amount, 0)
    const uniquePlayers = new Set(session.buyIns.map((b: any) => b.playerId))
    const activePlayersIds = [...uniquePlayers].filter(
      (pid) => !session.cashOuts.some((c: any) => c.playerId === pid)
    )

    const activePlayersData = activePlayersIds.map((pid) => {
      const allPlayerBuyIns = session.buyIns.filter((b: any) => b.playerId === pid)
      const approvedBuyIns = allPlayerBuyIns.filter((b: any) => b.status === "APPROVED")
      const pendingBuyIn = allPlayerBuyIns.find((b: any) => b.status === "PENDING")
      
      const player = allPlayerBuyIns[0].player
      return {
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        totalSpent: approvedBuyIns.reduce((sum: number, b: any) => sum + b.amount, 0),
        rebuyCount: approvedBuyIns.filter((b: any) => b.type === "REBUY").length,
        joinedAt: allPlayerBuyIns[0].createdAt,
        isPendingRebuy: !!pendingBuyIn,
        pendingRebuyAmount: pendingBuyIn ? pendingBuyIn.amount : null,
        pendingRebuyId: pendingBuyIn ? pendingBuyIn.id : null,
      }
    })

    const allEvents = buildSessionEvents(session)

    return {
      ...session,
      totalPot,
      playerCount: activePlayersIds.length,
      activePlayersData,
      events: allEvents,
    }
  },
  ["active-session"],
  { tags: ["active-session"] }
)

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
  const activeSession = await getActiveSessionCached()
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
  const activeSessionPromise = getActiveSessionCached() // Initiate request early

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
