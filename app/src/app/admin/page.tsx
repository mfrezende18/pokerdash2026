export const dynamic = "force-dynamic"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Administração — Poker Dash",
  description: "Painel de controle para gerenciar a mesa, jogadores e sessões.",
}

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { ActiveTableAdmin } from "@/components/features/ActiveTableAdmin"
import { ToggleRakeButton } from "@/components/features/ToggleRakeButton"

import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { getAuthSession } from "@/lib/auth"

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
    ? activeSession.buyIns.filter(b => b.status === "APPROVED").reduce((sum, b) => sum + b.amount, 0)
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
  const playerSummaries: Array<{
    id: string
    name: string
    avatarUrl: string | null
    totalBuyIn: number
    rebuys: number
    cashOutValue: number | null
    netResult: number | null
    isActive: boolean
    buyInRecords: number[]
    isPendingRebuy: boolean
    pendingRebuyAmount: number | null
    pendingRebuyId: string | null
  }> = []

  if (activeSession) {
    const playerIds = [...new Set(activeSession.buyIns.map((b) => b.playerId))]

    for (const pid of playerIds) {
      const allPlayerBuyIns = activeSession.buyIns.filter((b) => b.playerId === pid)
      const approvedBuyIns = allPlayerBuyIns.filter(b => b.status === "APPROVED")
      const pendingBuyIn = allPlayerBuyIns.find(b => b.status === "PENDING")
      
      const playerCashOut = activeSession.cashOuts.find((c) => c.playerId === pid)
      
      // If they only have a pending buy-in and no approved ones, their approved length is 0
      if (approvedBuyIns.length === 0 && !pendingBuyIn) continue;
      
      const player = allPlayerBuyIns[0].player

      playerSummaries.push({
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        totalBuyIn: approvedBuyIns.reduce((sum, b) => sum + b.amount, 0),
        rebuys: approvedBuyIns.filter((b) => b.type === "REBUY").length,
        cashOutValue: playerCashOut?.chipValue ?? null,
        netResult: playerCashOut?.netResult ?? null,
        isActive: !playerCashOut,
        buyInRecords: approvedBuyIns.map(b => b.amount),
        isPendingRebuy: !!pendingBuyIn,
        pendingRebuyAmount: pendingBuyIn ? pendingBuyIn.amount : null,
        pendingRebuyId: pendingBuyIn ? pendingBuyIn.id : null,
      })
    }
  }

  const systemSettings = await prisma.systemSettings.findFirst({
    select: { showRakeToUsers: true }
  })

  return {
    activeSession,
    totalPot,
    totalRake,
    rakePercent: activeSession?.rakePercent ?? 0,
    playerSummaries,
    showRakeToUsers: systemSettings?.showRakeToUsers ?? false,
  }
}

const getAllPlayersCached = unstable_cache(
  async () => {
    return prisma.user.findMany({
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: "asc" },
    })
  },
  ['all-players'],
  { revalidate: 3600, tags: ['players'] }
)

async function AdminContent() {
  const { activeSession, totalPot, totalRake, rakePercent, playerSummaries, showRakeToUsers } =
    await getAdminData()
  const [allPlayers, sessionUser] = await Promise.all([
    getAllPlayersCached(),
    getAuthSession()
  ])

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-8 rounded-2xl ios-shadow border border-surface-variant/20 flex flex-col items-center md:items-start">
          <span className="text-label-caps font-bold text-secondary mb-2 tracking-wider text-[11px]">
            POTE TOTAL
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-bold text-primary tracking-tighter">
              {formatCurrency(totalPot)}
            </span>
            {activeSession && (
              <span className="text-mono-data text-tertiary-fixed-dim text-sm">
                +{rakePercent}%
              </span>
            )}
          </div>
          <div className="w-full h-1 bg-surface-container-high rounded-full mt-6 overflow-hidden">
            <div className="w-3/4 h-full bg-primary transition-all duration-500" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl ios-shadow border border-surface-variant/20 flex flex-col items-center md:items-start relative">
          <span className="text-label-caps font-bold text-secondary mb-2 tracking-wider text-[11px]">
            TOTAL RAKE
          </span>
          {(sessionUser?.role === "ADMIN1" || sessionUser?.role === "ADMIN2") && (
            <ToggleRakeButton initialValue={showRakeToUsers} />
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-bold text-primary tracking-tighter">
              {formatCurrency(totalRake)}
            </span>
            <span className="text-mono-data text-secondary text-sm">
              {rakePercent > 0 ? `${rakePercent}%` : "Fixo"}
            </span>
          </div>
          <div className="w-full h-1 bg-surface-container-high rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((totalRake / Math.max(totalPot, 1)) * 100 * 5, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-title-md text-primary mb-6">Ações do Jogo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link
            href="/admin/session?action=buyin"
            className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
            </div>
            <span className="text-base text-primary font-bold">Registrar Buy-in</span>
            <p className="text-body-sm text-secondary mt-1">Adicionar stack</p>
          </Link>

          <Link
            href="/admin/session?action=rebuy"
            className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">restart_alt</span>
            </div>
            <span className="text-base text-primary font-bold">Add Re-buy</span>
            <p className="text-body-sm text-secondary mt-1">Recarregar jogador</p>
          </Link>

          <Link
            href="/admin/session?action=cashout"
            className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-base text-primary font-bold">Cash Out</span>
            <p className="text-body-sm text-secondary mt-1">Pagar jogador</p>
          </Link>

          {(sessionUser?.role === "ADMIN1" || sessionUser?.role === "ADMIN2") && (
            <>
              <Link
                href="/admin/session"
                className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <span className="text-base text-primary font-bold">Histórico</span>
                <p className="text-body-sm text-secondary mt-1">Ver sessões</p>
              </Link>

              <Link
                href="/admin/players"
                className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-base text-primary font-bold">Gerenciar Jogadores</span>
                <p className="text-body-sm text-secondary mt-1">Copiar convites</p>
              </Link>
              
              <Link
                href="/admin/events"
                className="group flex flex-col p-6 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl ios-shadow transition-all hover:bg-surface-container active:scale-95 text-left md:col-span-2"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <span className="text-base text-primary font-bold">Banners de Eventos</span>
                <p className="text-body-sm text-secondary mt-1">Upload de banners</p>
              </Link>
            </>
          )}
        </div>
      </section>

      <ActiveTableAdmin
        sessionId={activeSession?.id}
        sessionName={activeSession?.name}
        players={playerSummaries}
        allPlayers={allPlayers.map((p) => ({ id: p.id, name: p.name }))}
      />
    </>
  )
}

function AdminSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="h-40 bg-surface-container-high rounded-2xl"></div>
        <div className="h-40 bg-surface-container-high rounded-2xl"></div>
      </div>
      <div className="h-48 bg-surface-container-high rounded-2xl mb-10"></div>
      <div className="h-64 bg-surface-container-high rounded-2xl"></div>
    </div>
  )
}

export default async function AdminPage() {
  const sessionUser = await getAuthSession()
  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
        <Suspense fallback={<AdminSkeleton />}>
          <AdminContent />
        </Suspense>
      </main>

      <div className="fixed bottom-24 right-6 md:right-8 z-40">
        <Link
          href="/admin/session?action=new"
          className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:shadow-xl"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
        </Link>
      </div>

      <BottomNavBar role={sessionUser?.role} />
    </>
  )
}
