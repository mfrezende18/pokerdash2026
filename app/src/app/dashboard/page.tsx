export const dynamic = "force-dynamic"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Meu Dashboard — Poker Dash",
  description: "Dashboard pessoal de performance e histórico de sessões.",
}

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Suspense } from "react"
import { ProfitChart } from "@/components/features/ProfitChart"
import { ProfileForm } from "@/components/features/ProfileForm"

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      phone: true,
      pixKey: true,
      buyIns: {
        include: { session: true },
        orderBy: { createdAt: "asc" },
      },
      cashOuts: {
        include: { session: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!user) return null

  const closedBuyIns = user.buyIns.filter((b) => b.session.status === "CLOSED")
  const closedCashOuts = user.cashOuts.filter((c) => c.session.status === "CLOSED")

  const totalInvested = closedBuyIns.reduce((sum, b) => sum + b.amount, 0)
  const totalProfit = closedCashOuts.reduce((sum, c) => sum + c.netResult, 0)
  const totalSessions = new Set(closedBuyIns.map((b) => b.sessionId)).size
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
  const avgBuyInPerSession = totalSessions > 0 ? totalInvested / totalSessions : 0

  // Build session history
  const sessionIds = [...new Set(user.buyIns.map((b) => b.sessionId))]
  const sessions = await prisma.session.findMany({
    where: { id: { in: sessionIds } },
    select: {
      id: true,
      name: true,
      startedAt: true,
      status: true
    },
    orderBy: { startedAt: "desc" },
  })

  const sessionHistory = sessions.map((session) => {
    const buyIns = user.buyIns.filter((b) => b.sessionId === session.id)
    const cashOut = user.cashOuts.find((c) => c.sessionId === session.id)
    const totalBuyIn = buyIns.reduce((sum, b) => sum + b.amount, 0)

    return {
      id: session.id,
      name: session.name,
      date: session.startedAt,
      status: session.status,
      totalBuyIn,
      cashOutValue: cashOut?.chipValue ?? null,
      netResult: cashOut?.netResult ?? null,
    }
  })

  // Build profit over time data for chart
  const profitOverTime: Array<{ date: string; profit: number }> = []
  let cumulative = 0
  for (const session of sessions.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())) {
    const cashOut = user.cashOuts.find((c) => c.sessionId === session.id)
    if (cashOut) {
      cumulative += cashOut.netResult
      profitOverTime.push({
        date: formatDate(session.startedAt),
        profit: cumulative,
      })
    }
  }

  return {
    user,
    totalInvested,
    totalProfit,
    totalSessions,
    roi,
    avgBuyInPerSession,
    sessionHistory,
    profitOverTime,
  }
}

async function DashboardContent({ userId }: { userId: string }) {
  const data = await getUserData(userId)
  if (!data) return null

  return (
    <>
      <div className="mb-8">
        <h1 className="text-headline-lg text-primary">
          Olá, {data.user.name.split(" ")[0]}
        </h1>
        <p className="text-body-lg text-secondary mt-1">
          Seu dashboard pessoal de performance
        </p>
      </div>

      <ProfileForm 
        initialPhone={data.user.phone} 
        initialPixKey={data.user.pixKey} 
        initialAvatar={data.user.avatarUrl} 
        name={data.user.name} 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-surface-container-lowest rounded-2xl p-5 ios-shadow border border-surface-variant/20">
          <p className="text-label-caps text-secondary text-[10px] mb-1">
            LUCRO TOTAL
          </p>
          <p
            className={cn(
              "text-title-md font-bold",
              data.totalProfit >= 0 ? "text-on-tertiary-container" : "text-error"
            )}
          >
            {data.totalProfit > 0 ? "+" : ""}
            {formatCurrency(data.totalProfit)}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 ios-shadow border border-surface-variant/20">
          <p className="text-label-caps text-secondary text-[10px] mb-1">
            ROI
          </p>
          <p className="text-title-md font-bold text-primary">
            {data.roi.toFixed(1)}%
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 ios-shadow border border-surface-variant/20">
          <p className="text-label-caps text-secondary text-[10px] mb-1">
            INVESTIDO
          </p>
          <p className="text-title-md font-bold text-primary">
            {formatCurrency(data.totalInvested)}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 ios-shadow border border-surface-variant/20">
          <p className="text-label-caps text-secondary text-[10px] mb-1">
            MÉDIA/SESSÃO
          </p>
          <p className="text-title-md font-bold text-primary">
            {formatCurrency(data.avgBuyInPerSession)}
          </p>
        </div>
      </div>

      {data.profitOverTime.length > 1 && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ios-shadow border border-surface-variant/20 mb-10">
          <h3 className="text-title-md text-primary mb-6">
            Lucro ao Longo do Tempo
          </h3>
          <ProfitChart data={data.profitOverTime} />
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl ios-shadow border border-surface-variant/20 overflow-hidden mb-10">
        <div className="p-6 card-divider">
          <h3 className="text-title-md text-primary">Histórico de Sessões</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-label-caps text-secondary border-b border-surface-variant/20">
                <th className="px-6 py-4 font-bold text-[11px]">DATA</th>
                <th className="px-6 py-4 font-bold text-[11px]">SESSÃO</th>
                <th className="px-6 py-4 font-bold text-[11px]">BUY-IN</th>
                <th className="px-6 py-4 font-bold text-[11px]">CASH-OUT</th>
                <th className="px-6 py-4 font-bold text-right text-[11px]">RESULTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/10">
              {data.sessionHistory.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-6 py-4 text-body-sm text-secondary">
                    {formatDate(session.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-sm">
                        {session.name}
                      </span>
                      {session.status === "ACTIVE" && (
                        <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-mono-data text-primary">
                    {formatCurrency(session.totalBuyIn)}
                  </td>
                  <td className="px-6 py-4 text-mono-data text-secondary">
                    {session.cashOutValue !== null
                      ? formatCurrency(session.cashOutValue)
                      : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-mono-data text-right font-bold",
                      session.netResult === null
                        ? "text-secondary"
                        : session.netResult > 0
                        ? "text-on-tertiary-container"
                        : session.netResult < 0
                        ? "text-error"
                        : "text-primary"
                    )}
                  >
                    {session.netResult === null
                      ? "Em jogo"
                      : session.netResult > 0
                      ? `+${formatCurrency(session.netResult)}`
                      : formatCurrency(session.netResult)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-16 w-1/3 bg-surface-container-high rounded-lg mb-8"></div>
      <div className="h-24 w-full bg-surface-container-high rounded-2xl mb-10"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-container-high rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-surface-container-high rounded-2xl mb-10"></div>
      <div className="h-80 bg-surface-container-high rounded-2xl"></div>
    </div>
  )
}

export default async function DashboardPage() {
  const sessionUser = await getAuthSession()
  
  if (!sessionUser) {
    redirect("/login")
  }

  return (
    <>
      <TopAppBar avatarUrl={sessionUser.avatarUrl ?? undefined} />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent userId={sessionUser.id} />
        </Suspense>
      </main>

      <BottomNavBar />
    </>
  )
}
