"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { getDetailedSession } from "@/app/caixa/actions"
import { GenerateReceiptButton } from "@/app/admin/session/GenerateReceiptButton"

interface BasicSession {
  id: string
  name: string
  startedAtFormatted: string
  buyIns: { amount: number }[]
  rakeCollected: number
}

interface HistoryListClientProps {
  sessions: BasicSession[]
  currentUserRole?: string
}

export function HistoryListClient({ sessions, currentUserRole }: HistoryListClientProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [detailedSession, setDetailedSession] = useState<any | null>(null)

  const openModal = async (id: string) => {
    setSelectedSessionId(id)
    setLoading(true)
    try {
      const data = await getDetailedSession(id)
      setDetailedSession(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedSessionId(null)
    setDetailedSession(null)
  }

  const handleDelete = async () => {
    if (!selectedSessionId) return
    if (!window.confirm("Tem certeza que deseja apagar esta mesa do Histórico? Toda a matemática das planilhas será ajustada automaticamente.")) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/sessions/${selectedSessionId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        closeModal()
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao apagar mesa")
      }
    } catch (e) {
      alert("Erro de conexão")
    } finally {
      setIsDeleting(false)
    }
  }

  // Se já buscou os dados, agrupar por jogador
  let ranking: any[] = []
  if (detailedSession) {
    const playerStats = new Map<string, any>()

    detailedSession.buyIns.forEach((buyIn: any) => {
      if (!playerStats.has(buyIn.playerId)) {
        playerStats.set(buyIn.playerId, {
          name: buyIn.player.name,
          avatarUrl: buyIn.player.avatarUrl,
          totalBuyIn: 0,
          entries: 0,
          cashOut: 0,
          netResult: 0
        })
      }
      const stat = playerStats.get(buyIn.playerId)!
      stat.totalBuyIn += buyIn.amount
      stat.entries += 1
    })

    detailedSession.cashOuts.forEach((cashOut: any) => {
      if (playerStats.has(cashOut.playerId)) {
        const stat = playerStats.get(cashOut.playerId)!
        stat.cashOut = cashOut.chipValue
        stat.netResult = cashOut.netResult
      }
    })

    ranking = Array.from(playerStats.values()).sort((a, b) => b.netResult - a.netResult)
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map(session => {
          const sessionPot = session.buyIns.reduce((sum, b) => sum + b.amount, 0)
          
          return (
            <div 
              key={session.id} 
              onClick={() => openModal(session.id)}
              className="group bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant/20 flex items-center justify-between transition-all hover:bg-surface-container active:scale-95 cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-primary group-hover:text-amber-500 transition-colors">{session.name}</h3>
                <p className="text-body-sm text-secondary flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {session.startedAtFormatted}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold text-primary block">{formatCurrency(sessionPot)}</span>
                  <span className="text-body-sm text-secondary">{session.buyIns.length} Entradas</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal / Popup */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-surface-variant/20">
              <h2 className="text-title-md text-primary">Detalhes da Sessão</h2>
              <div className="flex items-center gap-3">
                {detailedSession && (currentUserRole === "ADMIN1" || currentUserRole === "ADMIN2" || currentUserRole === "ADMIN3") && (
                  <GenerateReceiptButton session={detailedSession} />
                )}
                {currentUserRole === "ADMIN1" && (
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-bold text-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    {isDeleting ? "Apagando..." : "Apagar Jogo"}
                  </button>
                )}
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Conteúdo Modal */}
            <div className="p-5 overflow-y-auto custom-scrollbar">
              {loading || !detailedSession ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-4xl text-amber-500 mb-4">
                    progress_activity
                  </span>
                  <p className="text-secondary">Buscando dados da mesa...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-headline-sm text-primary mb-1">{detailedSession.name}</h3>
                    <p className="text-body-sm text-secondary">
                      {new Date(detailedSession.startedAt).toLocaleDateString("pt-BR")} 
                      {detailedSession.closedAt && ` - Finalizada`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface-container p-4 rounded-xl">
                      <span className="text-label-sm text-secondary block mb-1">Pote Total</span>
                      <span className="font-bold text-primary">{formatCurrency(detailedSession.buyIns.reduce((sum:any, b:any) => sum + b.amount, 0))}</span>
                    </div>
                    <div className="bg-surface-container p-4 rounded-xl">
                      <span className="text-label-sm text-secondary block mb-1">Total de Entradas</span>
                      <span className="font-bold text-primary">{detailedSession.buyIns.length}</span>
                    </div>
                  </div>

                  <h4 className="text-title-sm text-primary mb-3">Resultado dos Jogadores</h4>
                  <div className="space-y-2">
                    {ranking.map((player, idx) => (
                      <div key={idx} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {player.avatarUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-variant">
                              {player.avatarUrl.startsWith("http") ? (
                                <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm">{player.avatarUrl}</div>
                              )}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0">
                              <span className="font-bold text-secondary">{player.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-primary block">{player.name}</span>
                            <span className="text-label-sm text-secondary">{player.entries} entrada{player.entries !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className={`font-bold px-3 py-1 rounded-lg ${
                          player.netResult >= 0 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {player.netResult > 0 ? "+" : ""}{formatCurrency(player.netResult)}
                        </div>
                      </div>
                    ))}
                    {ranking.length === 0 && (
                      <div className="text-center py-6 text-secondary">
                        Nenhum jogador registrado.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
