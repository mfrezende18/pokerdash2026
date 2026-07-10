import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { prisma } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getAuthSession } from "@/lib/auth"
import { NewSessionForm } from "./NewSessionForm"
import { EditSessionModal } from "./EditSessionModal"
import { DeleteSessionButton } from "./DeleteSessionButton"

export const dynamic = "force-dynamic"

export default async function SessionPage() {
  const sessionUser = await getAuthSession()
  
  const sessions = await prisma.session.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      buyIns: { include: { player: true } },
      cashOuts: { include: { player: true } },
    }
  })

  const isAdmin1 = sessionUser?.role === "ADMIN1"

  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 mb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-headline-lg text-primary">Sessões</h1>
            <p className="text-body-lg text-secondary mt-1">
              Gerenciar mesas e histórico
            </p>
          </div>
          <NewSessionForm />
        </div>

        <div className="space-y-4">
          {sessions.map(session => {
            const pot = session.buyIns.reduce((sum, b) => sum + b.amount, 0)
            const isClosed = session.status === "CLOSED"

            return (
              <div key={session.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-variant/20 apple-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-title-md text-primary font-bold">{session.name}</h3>
                    <p className="text-body-sm text-secondary">{formatDate(session.startedAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${isClosed ? "bg-surface-container-high text-secondary" : "bg-primary text-on-primary"}`}>
                      {isClosed ? "FINALIZADA" : "ATIVA"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-label-caps text-secondary text-[10px] mb-1">POTE TOTAL</span>
                    <span className="text-title-md text-primary font-bold">{formatCurrency(pot)}</span>
                  </div>

                  {isClosed && isAdmin1 && (
                    <div className="flex items-center">
                      <EditSessionModal session={session} />
                      <DeleteSessionButton sessionId={session.id} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {sessions.length === 0 && (
            <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-surface-variant/20">
              <span className="material-symbols-outlined text-4xl text-secondary/50 mb-2">history_off</span>
              <p className="text-secondary">Nenhuma sessão registrada</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar role={sessionUser?.role} />
    </>
  )
}
