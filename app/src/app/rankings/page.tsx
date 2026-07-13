export const dynamic = "force-dynamic"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rankings — Poker Dash",
  description: "Classificação geral dos jogadores baseada em participação e lucro líquido.",
}

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import Image from "next/image"
import { cn, formatCurrency, formatPercent } from "@/lib/utils"
import { RankingTableClient } from "@/components/features/RankingTableClient"
import { computePlayerBadges } from "@/lib/ranking-utils"

import { Suspense } from "react"

async function getRankings() {
  const [users, closedSessions, totalSessionsCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        cashOuts: { select: { netResult: true, sessionId: true }, where: { session: { status: "CLOSED" } } },
        buyIns: { select: { amount: true, sessionId: true }, where: { session: { status: "CLOSED" }, status: "APPROVED" } }
      },
    }),
    // Fetch closed sessions with buyIns and cashOuts for badge computation
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
    prisma.session.count({ where: { status: "CLOSED" } })
  ])

  const halfSessions = totalSessionsCount / 2

  const computed = users
    .map((user) => {
      const totalProfit = user.cashOuts.reduce((sum, c) => sum + c.netResult, 0)
      const totalSessions = new Set(user.buyIns.map((b) => b.sessionId)).size
      const totalInvested = user.buyIns.reduce((sum, b) => sum + b.amount, 0)
      const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
      
      const wins = user.cashOuts.filter((c) => c.netResult > 0).length
      const winRateVal = totalSessions > 0 ? (wins / totalSessions) * 100 : 0
      const winRateText = `${wins}/${totalSessions}`
      const isTourist = totalSessions < halfSessions
      const averageSpent = totalSessions > 0 ? totalInvested / totalSessions : 0

      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        winRateVal,
        winRateText,
        isTourist,
        roi,
        totalProfit,
        totalSessions,
        totalInvested,
        averageSpent,
      }
    })
    .filter((r) => r.totalSessions > 0)

  // Sort: Regulars first, then Tourists. Within group: WinRate DESC, then Profit DESC
  computed.sort((a, b) => {
    if (a.isTourist !== b.isTourist) {
      return a.isTourist ? 1 : -1
    }
    if (b.winRateVal !== a.winRateVal) {
      return b.winRateVal - a.winRateVal
    }
    return b.totalProfit - a.totalProfit
  })

  // Compute badges
  const playerIds = computed.map(p => p.id)
  const badgeMap = computePlayerBadges(closedSessions, playerIds)

  // Enrich rankings with badge data
  return computed.map(player => {
    const badgeData = badgeMap.get(player.id)
    return {
      ...player,
      badge: badgeData?.badge ?? null,
      streakCount: badgeData?.streakCount ?? 0,
      positionDelta: badgeData?.positionDelta ?? null,
    }
  })
}

const medals = ["🥇", "🥈", "🥉"]

async function RankingsContent() {
  const rankings = await getRankings()

  return (
    <>
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {rankings.slice(0, 3).map((player, index) => {
            const isInactive = player.badge === "inactive"
            const isStreak = player.badge === "streak"

            return (
              <div
                key={player.id}
                className={cn(
                  "bg-surface-container-lowest rounded-2xl p-6 apple-shadow border border-surface-variant/20 text-center",
                  index === 0 && "md:order-2 md:scale-105 md:-mt-2",
                  index === 1 && "md:order-1",
                  index === 2 && "md:order-3"
                )}
              >
                {/* Avatar with badges */}
                <div className="relative inline-block mb-3">
                  {/* Position badge (top-left) */}
                  <div className={cn(
                    "absolute -top-2 -left-2 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-md",
                    isInactive
                      ? "bg-blue-100 border border-blue-200"
                      : "bg-amber-50 border border-amber-200"
                  )}>
                    {isInactive ? (
                      <span className="text-base">{`${index + 1}º`}</span>
                    ) : (
                      <span className="text-xl">{medals[index]}</span>
                    )}
                  </div>

                  {/* Activity badge (top-right) */}
                  {(isInactive || isStreak) && (
                    <div className="absolute -top-2 -right-2 z-10 flex items-center gap-0.5">
                      {isInactive && (
                        <span className="text-2xl drop-shadow-sm" title="Jogador inativo (não jogou nas últimas 4 sessões)">🥶</span>
                      )}
                      {isStreak && player.streakCount >= 2 && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5" title={`${player.streakCount} vitórias seguidas`}>
                          {player.streakCount}<span className="text-sm">🔥</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Avatar */}
                  {player.avatarUrl ? (
                    player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
                      <Image
                        src={player.avatarUrl}
                        alt={player.name}
                        width={80}
                        height={80}
                        className={cn(
                          "w-20 h-20 rounded-full object-cover border-4",
                          isInactive ? "border-blue-200/60 grayscale-[40%] opacity-80" : "border-surface-variant/30"
                        )}
                      />
                    ) : (
                      <div className={cn(
                        "w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-4xl shadow-sm border-4",
                        isInactive ? "border-blue-200/60 opacity-80" : "border-surface-variant/30"
                      )}>
                        {player.avatarUrl}
                      </div>
                    )
                  ) : (
                    <div className={cn(
                      "w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center border-4",
                      isInactive ? "border-blue-200/60 opacity-80" : "border-surface-variant/30"
                    )}>
                      <span className="text-2xl font-bold text-secondary">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-title-md text-primary">
                  {player.name}
                  {/* Position arrow */}
                  {player.positionDelta !== null && player.positionDelta !== 0 && (
                    <span className={cn(
                      "ml-1.5 text-sm font-bold inline-flex items-center",
                      player.positionDelta < 0 ? "text-green-600" : "text-red-500"
                    )}>
                      {player.positionDelta < 0 ? "↑" : "↓"}
                    </span>
                  )}
                  {player.positionDelta === 0 && (
                    <span className="ml-1.5 text-sm text-secondary/60 inline-flex items-center">—</span>
                  )}
                </h3>
                <p className="text-mono-data text-secondary mt-1">
                  {player.winRateText} ({formatPercent(player.winRateVal)})
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <div>
                    <p className="text-label-caps text-secondary text-[10px]">
                      LUCRO
                    </p>
                    <p
                      className={cn(
                        "text-mono-data font-bold",
                        player.totalProfit >= 0
                          ? "text-on-tertiary-container"
                          : "text-error"
                      )}
                    >
                      {formatCurrency(player.totalProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-caps text-secondary text-[10px]">
                      ROI
                    </p>
                    <p className="text-mono-data font-bold text-primary">
                      {formatPercent(player.roi)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <RankingTableClient initialRankings={rankings} />
    </>
  )
}

function RankingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="h-64 bg-surface-container-high rounded-2xl md:order-2 md:scale-105"></div>
        <div className="h-64 bg-surface-container-high rounded-2xl md:order-1"></div>
        <div className="h-64 bg-surface-container-high rounded-2xl md:order-3"></div>
      </div>
      <div className="h-96 w-full bg-surface-container-high rounded-2xl"></div>
    </div>
  )
}

export default function RankingsPage() {
  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-headline-lg text-primary">Rankings</h1>
          <p className="text-body-lg text-secondary mt-1">
            Classificação baseada em participação + lucro líquido
          </p>
        </div>

        <Suspense fallback={<RankingSkeleton />}>
          <RankingsContent />
        </Suspense>
      </main>

      <BottomNavBar />
    </>
  )
}
