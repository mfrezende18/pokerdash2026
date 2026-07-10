import type { Metadata } from "next"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
import { HistoryListClient } from "@/components/features/HistoryListClient"

export const metadata: Metadata = {
  title: "Histórico de Mesas — PokerAdmin",
  description: "Histórico completo de todas as sessões de poker realizadas.",
}

export const dynamic = "force-dynamic"

export default async function CaixaPage() {
  const sessionUser = await getAuthSession()
  
  if (!sessionUser) {
    redirect("/login")
  }

  // Pega todas as sessões fechadas para exibir no histórico
  const sessions = await prisma.session.findMany({
    where: { status: "CLOSED" },
    orderBy: { startedAt: "desc" },
    include: {
      buyIns: true,
      cashOuts: true,
    }
  })

  // Calcula Pote Total Geral de todas as sessões
  const totalPotGeral = sessions.reduce((acc, session) => {
    return acc + session.buyIns.reduce((sum, b) => sum + b.amount, 0)
  }, 0)

  const sessoesJogadas = sessions.length

  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-10 mb-24">
        <h1 className="text-title-md text-primary mb-6">Histórico de Mesas</h1>

        {/* Resumo */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl apple-shadow border border-surface-variant/20">
            <span className="text-label-caps font-bold text-secondary mb-1 block">Pote Total Histórico</span>
            <span className="text-title-md font-bold text-primary tracking-tight">
              {formatCurrency(totalPotGeral)}
            </span>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-2xl apple-shadow border border-surface-variant/20">
            <span className="text-label-caps font-bold text-secondary mb-1 block">Sessões Realizadas</span>
            <span className="text-title-md font-bold text-primary tracking-tight">
              {sessoesJogadas}
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-title-md text-primary mb-4">Histórico de Mesas</h2>
          
          <HistoryListClient 
            sessions={sessions.map(s => ({
              id: s.id,
              name: s.name,
              startedAtFormatted: s.startedAt.toLocaleDateString("pt-BR"),
              buyIns: s.buyIns.map(b => ({ amount: b.amount })),
              rakeCollected: s.rakeCollected
            }))} 
          />
        </section>
      </main>

      <BottomNavBar role={sessionUser.role} />
    </>
  )
}
