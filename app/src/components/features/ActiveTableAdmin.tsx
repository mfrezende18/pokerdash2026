"use client"

import { cn, formatCurrency, getInitials } from "@/lib/utils"
import { useState } from "react"
import Image from "next/image"

interface PlayerSummary {
  id: string
  name: string
  avatarUrl: string | null
  totalBuyIn: number
  rebuys: number
  cashOutValue: number | null
  netResult: number | null
  isActive: boolean
}

interface ActiveTableAdminProps {
  sessionId?: string
  sessionName?: string
  players: PlayerSummary[]
  allPlayers: Array<{ id: string; name: string }>
}

export function ActiveTableAdmin({
  sessionId,
  sessionName,
  players,
  allPlayers,
}: ActiveTableAdminProps) {
  const [showBuyInModal, setShowBuyInModal] = useState(false)
  const [showCashOutModal, setShowCashOutModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBuyIn = async (type: "INITIAL" | "REBUY") => {
    if (!selectedPlayer || !amount || !sessionId) return
    setIsSubmitting(true)

    try {
      await fetch(`/api/sessions/${sessionId}/buyin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayer,
          amount: parseFloat(amount),
          type,
        }),
      })
      window.location.reload()
    } catch (error) {
      console.error("Erro ao registrar buy-in:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCashOut = async () => {
    if (!selectedPlayer || !amount || !sessionId) return
    setIsSubmitting(true)

    try {
      await fetch(`/api/sessions/${sessionId}/cashout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayer,
          chipValue: parseFloat(amount),
        }),
      })
      window.location.reload()
    } catch (error) {
      console.error("Erro ao processar cash-out:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModals = () => {
    setShowBuyInModal(false)
    setShowCashOutModal(false)
    setSelectedPlayer("")
    setAmount("")
  }

  // Compute summary totals like the spreadsheet
  const totalPot = players.reduce((sum, p) => sum + p.totalBuyIn, 0)
  const totalPositive = players
    .filter(p => p.netResult !== null && p.netResult > 0)
    .reduce((sum, p) => sum + p.netResult!, 0)
  const totalNegative = players
    .filter(p => p.netResult !== null && p.netResult < 0)
    .reduce((sum, p) => sum + p.netResult!, 0)

  if (!sessionId) {
    return (
      <section className="mb-10">
        <div className="bg-surface-container-lowest rounded-2xl ios-shadow border border-surface-variant/20 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary/30 mb-4 block">
            table_restaurant
          </span>
          <h3 className="text-title-md text-primary mb-2">Nenhuma mesa ativa</h3>
          <p className="text-body-sm text-secondary">
            Clique no botão + para abrir uma nova sessão
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="mb-10">
        <div className="bg-surface-container-lowest rounded-2xl ios-shadow border border-surface-variant/20 overflow-hidden">
          <div className="p-6 border-b border-surface-variant/20 flex justify-between items-center">
            <h3 className="text-title-md text-primary">Mesa Ativa</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
                <span className="text-label-caps text-on-tertiary-container text-[11px]">
                  LIVE
                </span>
              </div>
              <button
                onClick={async () => {
                  if(confirm("Tem certeza que deseja encerrar a mesa? Jogadores que não fizeram cash-out serão zerados (R$ 0).")) {
                    await fetch(`/api/sessions/${sessionId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "close" })
                    })
                    window.location.reload()
                  }
                }}
                className="bg-error-container text-on-error-container px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all"
              >
                Fechar Mesa
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  setShowBuyInModal(true)
                  setShowCashOutModal(false)
                }}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
              >
                + Buy-in
              </button>
              <button
                onClick={() => {
                  setShowCashOutModal(true)
                  setShowBuyInModal(false)
                }}
                className="bg-surface-container text-primary px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all border border-surface-variant/30"
              >
                Cash Out
              </button>
            </div>

            {/* Players Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-caps text-secondary border-b border-surface-variant/20">
                    <th className="pb-4 font-bold text-[11px]">JOGADOR</th>
                    <th className="pb-4 font-bold text-[11px]">BUY-IN</th>
                    <th className="pb-4 font-bold text-[11px]">RE-BUYS</th>
                    <th className="pb-4 font-bold text-[11px]">TOTAL GASTO</th>
                    <th className="pb-4 font-bold text-[11px]">CASHOUT</th>
                    <th className="pb-4 font-bold text-right text-[11px]">LUCRO/PREJUÍZO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td className="py-4 flex items-center gap-3">
                        {player.avatarUrl ? (
                          player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
                            <Image src={player.avatarUrl} alt={player.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-lg shadow-sm">
                              {player.avatarUrl}
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">
                            {getInitials(player.name)}
                          </div>
                        )}
                        <span className="font-bold text-primary text-sm">
                          {player.name}
                        </span>
                        {player.isActive && (
                          <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                        )}
                      </td>
                      <td className="py-4 text-mono-data text-primary">
                        {formatCurrency(player.totalBuyIn)}
                      </td>
                      <td className="py-4 text-mono-data text-secondary">
                        {player.rebuys}
                      </td>
                      <td className="py-4 text-mono-data text-primary font-semibold">
                        {formatCurrency(player.totalBuyIn)}
                      </td>
                      <td className="py-4 text-mono-data text-primary">
                        {player.cashOutValue !== null
                          ? formatCurrency(player.cashOutValue)
                          : "—"}
                      </td>
                      <td
                        className={cn(
                          "py-4 text-mono-data text-right font-bold",
                          player.netResult === null
                            ? "text-primary"
                            : player.netResult > 0
                            ? "text-green-600"
                            : player.netResult < 0
                            ? "text-error"
                            : "text-primary"
                        )}
                      >
                        {player.netResult === null
                          ? "—"
                          : player.netResult > 0
                          ? `+${formatCurrency(player.netResult)}`
                          : formatCurrency(player.netResult)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer - like the spreadsheet */}
            {players.length > 0 && (
              <div className="mt-6 pt-4 border-t border-surface-variant/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <span className="text-label-caps text-secondary text-[10px] block mb-1">TOTAL POT</span>
                    <span className="text-title-md text-primary font-bold">{formatCurrency(totalPot)}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <span className="text-label-caps text-secondary text-[10px] block mb-1">TOTAL (+)</span>
                    <span className="text-title-md text-green-600 font-bold">+{formatCurrency(totalPositive)}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <span className="text-label-caps text-secondary text-[10px] block mb-1">TOTAL (-)</span>
                    <span className="text-title-md text-error font-bold">{formatCurrency(totalNegative)}</span>
                  </div>
                  <div className={cn(
                    "rounded-xl p-4",
                    Math.abs(totalPositive + totalNegative) < 1
                      ? "bg-tertiary-container/30"
                      : "bg-error-container/30"
                  )}>
                    <span className="text-label-caps text-secondary text-[10px] block mb-1">CAIXA BATIDO</span>
                    <span className={cn(
                      "text-title-md font-bold flex items-center gap-1",
                      Math.abs(totalPositive + totalNegative) < 1
                        ? "text-on-tertiary-container"
                        : "text-error"
                    )}>
                      {Math.abs(totalPositive + totalNegative) < 1 ? (
                        <>
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Batido
                        </>
                      ) : (
                        formatCurrency(totalPositive + totalNegative)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Buy-in Modal */}
      {showBuyInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[480px] apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Registrar Buy-in / Re-buy</h3>
              <button
                onClick={closeModals}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  JOGADOR
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Selecionar jogador...</option>
                  {allPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  VALOR (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleBuyIn("INITIAL")}
                  disabled={isSubmitting || !selectedPlayer || !amount}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  Buy-in
                </button>
                <button
                  onClick={() => handleBuyIn("REBUY")}
                  disabled={isSubmitting || !selectedPlayer || !amount}
                  className="flex-1 bg-secondary-container text-primary py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  Re-buy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash-out Modal */}
      {showCashOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[480px] apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Cash Out</h3>
              <button
                onClick={closeModals}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  JOGADOR
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Selecionar jogador...</option>
                  {players
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Investido: {formatCurrency(p.totalBuyIn)})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  VALOR DAS FICHAS (R$)
                </label>
                <input
                  type="number"
                  placeholder="Quanto o jogador tem em fichas"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleCashOut}
                disabled={isSubmitting || !selectedPlayer || !amount}
                className="w-full bg-tertiary-container text-on-tertiary-container py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                Confirmar Cash Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
