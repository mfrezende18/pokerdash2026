export const dynamic = "force-dynamic"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rankings — PokerAdmin",
  description: "Classificação geral dos jogadores baseada em participação e lucro líquido.",
}

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import Image from "next/image"
import { cn, formatCurrency, formatPercent } from "@/lib/utils"
import { RankingTableClient } from "@/components/features/RankingTableClient"

import { Suspense } from "react"

async function getRankings() {
  const [users, totalSessionsCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        cashOuts: { select: { netResult: true, sessionId: true } },
        buyIns: { select: { amount: true, sessionId: true } }
      },
    }),
    prisma.session.count()
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
      }
    })
    .filter((r) => r.totalSessions > 0)

  // Sort: Regulars first, then Tourists. Within group: WinRate DESC, then Profit DESC
  return computed.sort((a, b) => {
    if (a.isTourist !== b.isTourist) {
      return a.isTourist ? 1 : -1
    }
    if (b.winRateVal !== a.winRateVal) {
      return b.winRateVal - a.winRateVal
    }
    return b.totalProfit - a.totalProfit
  })
}

const medals = ["🥇", "🥈", "🥉"]

async function RankingsContent() {
  const rankings = await getRankings()

  return (
    <>
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {rankings.slice(0, 3).map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "bg-surface-container-lowest rounded-2xl p-6 apple-shadow border border-surface-variant/20 text-center",
                index === 0 && "md:order-2 md:scale-105 md:-mt-2",
                index === 1 && "md:order-1",
                index === 2 && "md:order-3"
              )}
            >
              <span className="text-4xl mb-3 block">{medals[index]}</span>
              {player.avatarUrl ? (
                <Image
                  src={player.avatarUrl}
                  alt={player.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-surface-variant/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface-container-high mx-auto mb-3 flex items-center justify-center border-4 border-surface-variant/30">
                  <span className="text-2xl font-bold text-secondary">
                    {player.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-title-md text-primary">{player.name}</h3>
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
          ))}
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
