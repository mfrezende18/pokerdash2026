import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

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
        <h1 className="text-title-lg text-primary mb-6">Histórico de Mesas</h1>

        {/* Resumo */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl apple-shadow border border-surface-variant/20">
            <span className="text-label-caps font-bold text-secondary mb-1 block">Pote Total Histórico</span>
            <span className="text-title-lg font-bold text-primary tracking-tight">
              {formatCurrency(totalPotGeral)}
            </span>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-2xl apple-shadow border border-surface-variant/20">
            <span className="text-label-caps font-bold text-secondary mb-1 block">Sessões Realizadas</span>
            <span className="text-title-lg font-bold text-primary tracking-tight">
              {sessoesJogadas}
            </span>
          </div>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-title-md text-primary mb-4">Histórico de Mesas</h2>
          
          <div className="space-y-4">
            {sessions.map(session => {
              const sessionPot = session.buyIns.reduce((sum, b) => sum + b.amount, 0)
              
              return (
                <div key={session.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant/20 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary">{session.name}</h3>
                    <p className="text-body-sm text-secondary">
                      {session.startedAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary block">{formatCurrency(sessionPot)}</span>
                    <span className="text-body-sm text-secondary">{session.buyIns.length} Entradas</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <BottomNavBar role={sessionUser.role} />
    </>
  )
}
