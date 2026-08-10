"use client"

import { cn, formatCurrency, getInitials } from "@/lib/utils"
import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ReceiptTable, ReceiptPlayerData } from "./ReceiptTable"

interface PlayerSummary {
  id: string
  name: string
  avatarUrl: string | null
  totalBuyIn: number
  rebuys: number
  cashOutValue: number | null
  netResult: number | null
  isActive: boolean
  buyInRecords?: number[]
  isPendingRebuy: boolean
  pendingRebuyAmount: number | null
  pendingRebuyId: string | null
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
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [rakeAmount, setRakeAmount] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingCashOuts, setPendingCashOuts] = useState<Record<string, string>>({})
  const [sessionClosedSuccessfully, setSessionClosedSuccessfully] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  // Pending Rebuy State
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedPendingRebuy, setSelectedPendingRebuy] = useState<PlayerSummary | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null)

  // Polling removed in favor of SupabaseRealtimeProvider

  const handleBuyIn = async (type: "INITIAL" | "REBUY") => {
    if (!selectedPlayer || !amount || !sessionId) return
    setIsSubmitting(true)
    
    // Guardar os valores e fechar o modal instantaneamente para UX
    const currentPlayer = selectedPlayer
    const currentAmount = amount
    closeModals()

    try {
      await fetch(`/api/sessions/${sessionId}/buyin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: currentPlayer,
          amount: parseFloat(currentAmount),
          type,
        }),
      })
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("Erro ao registrar buy-in:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCashOut = async () => {
    if (!selectedPlayer || !amount || !sessionId) return
    setIsSubmitting(true)

    const currentPlayer = selectedPlayer
    const currentAmount = amount
    closeModals()

    try {
      await fetch(`/api/sessions/${sessionId}/cashout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: currentPlayer,
          chipValue: parseFloat(currentAmount),
        }),
      })
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("Erro ao processar cash-out:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModals = () => {
    setShowBuyInModal(false)
    setShowCashOutModal(false)
    setShowCloseModal(false)
    setSelectedPlayer("")
    setAmount("")
    setRakeAmount("")
  }

  const handleCloseSession = async () => {
    if (!sessionId) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "close", 
          rakeCollected: parseFloat(rakeAmount) || 0,
          pendingCashOuts: Object.fromEntries(
            Object.entries(pendingCashOuts).map(([pid, val]) => [pid, parseFloat(val) || 0])
          )
        })
      })
      setShowCloseModal(false)
      setSessionClosedSuccessfully(true)
    } catch (error) {
      console.error("Erro ao fechar mesa:", error)
      setIsSubmitting(false)
    }
  }

  // Compute summary totals like the spreadsheet
  const totalPot = players.reduce((sum, p) => sum + p.totalBuyIn, 0)
  const totalPositive = players
    .filter(p => p.netResult !== null && p.netResult > 0)
    .reduce((sum, p) => sum + p.netResult!, 0)
  const totalNegative = players
    .filter(p => p.netResult !== null && p.netResult < 0)
    .reduce((sum, p) => sum + p.netResult!, 0)

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return
    try {
      setIsGeneratingImage(true)
      const { toPng } = await import("html-to-image")
      
      // html-to-image sometimes needs a warmup on Safari
      await toPng(receiptRef.current, { quality: 1, backgroundColor: "#000" })
      const dataUrl = await toPng(receiptRef.current, { quality: 1, backgroundColor: "#000" })
      
      const fileName = `Comprovante-${sessionName?.replace(/\s+/g, "-") || "Sessao"}.png`
      
      try {
        // Tentar usar a API de compartilhamento nativa (ótimo para iOS/Android)
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], fileName, { type: blob.type })
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Comprovante de Sessão',
            files: [file]
          })
          return
        }
      } catch (shareErr) {
        console.log("Share API não suportada ou falhou, tentando fallback...", shareErr)
      }

      // Fallback 1: Forçar download tradicional
      const link = document.createElement("a")
      link.download = fileName
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (err) {
      console.error("Erro ao gerar imagem", err)
      alert("Não foi possível gerar a imagem. Verifique se o navegador tem permissão.")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleApproveRebuy = async (action: "APPROVE" | "REJECT") => {
    if (!selectedPendingRebuy?.pendingRebuyId || !sessionId) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/sessions/${sessionId}/approve-rebuy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyInId: selectedPendingRebuy.pendingRebuyId,
          action,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Erro ao processar solicitação")
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao processar re-buy")
    } finally {
      setIsSubmitting(false)
      setShowApproveModal(false)
      setSelectedPendingRebuy(null)
      startTransition(() => {
        router.refresh()
      })
    }
  }

  if (sessionClosedSuccessfully) {  }

  // Se a mesa foi fechada agora, e pediu comprovante:
  if (sessionClosedSuccessfully && showReceipt) {
    // Sort players by profit (highest first)
    const sortedPlayers = [...players].sort((a, b) => {
      const netA = a.netResult !== null ? a.netResult : ((parseFloat(pendingCashOuts[a.id]) || 0) - a.totalBuyIn)
      const netB = b.netResult !== null ? b.netResult : ((parseFloat(pendingCashOuts[b.id]) || 0) - b.totalBuyIn)
      return netB - netA
    })

    const receiptPlayers: ReceiptPlayerData[] = sortedPlayers.map(p => {
      const cOut = p.cashOutValue !== null ? p.cashOutValue : parseFloat(pendingCashOuts[p.id]) || 0
      const net = cOut - p.totalBuyIn
      
      // If we don't have explicit buyInRecords, mock them based on totalBuyIn and rebuys count
      let buyInRecords = p.buyInRecords
      if (!buyInRecords || buyInRecords.length === 0) {
        const entryCount = p.rebuys + 1
        const avg = p.totalBuyIn / entryCount
        buyInRecords = Array.from({ length: entryCount }).fill(avg) as number[]
      }

      // First entry is buyin, rest are rebuys
      const initialBuyIn = buyInRecords[0] || p.totalBuyIn
      const actualRebuys = buyInRecords.slice(1)

      return {
        id: p.id,
        name: p.name,
        buyIn: initialBuyIn,
        rebuys: actualRebuys,
        totalSpent: p.totalBuyIn,
        cashOut: cOut,
        profit: net > 0 ? net : 0,
        loss: net < 0 ? net : 0
      }
    })

    return (
      <section className="mb-10 max-w-full mx-auto px-2 md:px-0">
        <div className="bg-surface-container-lowest rounded-3xl ios-shadow border border-surface-variant/20 overflow-hidden flex flex-col">
          <div className="bg-primary text-on-primary p-6 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-80">receipt_long</span>
            <h3 className="text-title-lg font-bold">Comprovante de Sessão</h3>
            <p className="text-sm opacity-80 mt-1">{sessionName}</p>
          </div>
          
          <div className="p-4 bg-surface-container-lowest overflow-x-auto">
            {/* The actual table that will be captured */}
            <div className="min-w-max mx-auto border-4 border-black rounded-lg overflow-hidden">
              <ReceiptTable 
                ref={receiptRef}
                date={format(new Date(), "dd/MM/yyyy")}
                locationName={sessionName?.split("-")?.[1]?.trim() || "Poker Dash"}
                players={receiptPlayers}
                rake={parseFloat(rakeAmount) || 0}
                totalPot={totalPot}
                totalPositive={totalPositive}
                totalNegative={totalNegative}
                isMathCorrect={Math.abs(totalPositive + totalNegative + Number(rakeAmount || 0)) < 1}
              />
            </div>
          </div>

          <div className="p-6 bg-surface-container-lowest border-t border-surface-variant/20 space-y-3">
            <button
              onClick={handleDownloadReceipt}
              disabled={isGeneratingImage}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">download</span>
              {isGeneratingImage ? "Gerando Imagem..." : "Baixar Imagem da Tabela"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-surface-container-high hover:bg-surface-variant text-primary py-3.5 rounded-xl font-bold transition-all"
            >
              Concluir e Sair
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!sessionId) {
    return (
      <section className="mb-10">
        <div className="bg-surface-container-lowest rounded-2xl ios-shadow border border-surface-variant/20 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary/30 mb-4 block">
            table_restaurant
          </span>
          <h3 className="text-title-md text-primary mb-2">Nenhuma mesa ativa</h3>
          <p className="text-body-sm text-secondary">
            Inicie uma nova sessão para começar a registrar as movimentações financeiras.
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
                onClick={() => {
                  setShowCloseModal(true)
                  setShowBuyInModal(false)
                  setShowCashOutModal(false)
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
                  setAmount("50")
                  setShowBuyInModal(true)
                  setShowCashOutModal(false)
                }}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
              >
                + Buy-in
              </button>
              <button
                onClick={() => {
                  setAmount("")
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
                        <button 
                          className={cn(
                            "relative block rounded-full focus:outline-none",
                            player.isPendingRebuy && "ring-4 ring-orange-500 animate-pulse active:scale-95"
                          )}
                          onClick={() => {
                            if (player.isPendingRebuy) {
                              setSelectedPendingRebuy(player)
                              setShowApproveModal(true)
                            }
                          }}
                          disabled={!player.isPendingRebuy}
                        >
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
                        </button>
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

      {/* Buy-In Modal */}
      {showBuyInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-6 pb-24 md:p-8 md:pb-24 w-[90vw] max-w-[400px] max-h-[90vh] overflow-y-auto apple-shadow border border-surface-variant/20"
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

      {/* Cash-Out Modal */}
      {showCashOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-6 pb-24 md:p-8 md:pb-24 w-[90vw] max-w-[400px] max-h-[90vh] overflow-y-auto apple-shadow border border-surface-variant/20"
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
      {/* Close Session Modal */}
      {showCloseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-6 pb-24 md:p-8 md:pb-24 w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Encerrar Mesa</h3>
              <button
                onClick={closeModals}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <p className="text-body-md text-secondary">
                Insira o valor arrecadado de rake e os cashouts pendentes para validar a matemática do caixa.
              </p>

              {/* Pending Cashouts for active players */}
              {(() => {
                const activePlayers = players.filter(p => p.isActive)
                if (activePlayers.length === 0) return null

                return (
                  <div className="bg-surface-container-high/50 p-4 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-error flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      Jogadores sem Cash-out
                    </h4>
                    <p className="text-xs text-secondary mb-2">
                      É obrigatório informar o valor final em fichas de todos os jogadores antes de encerrar. Insira 0 se o jogador perdeu tudo.
                    </p>
                    {activePlayers.map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-primary truncate">{p.name}</p>
                          <p className="text-[10px] text-secondary">Investido: {formatCurrency(p.totalBuyIn)}</p>
                        </div>
                        <input
                          type="number"
                          placeholder="Fichas"
                          value={pendingCashOuts[p.id] ?? ""}
                          onChange={(e) => setPendingCashOuts(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-24 border border-outline-variant/40 rounded-lg px-3 py-2 bg-white text-primary text-sm focus:border-primary focus:outline-none transition-colors text-right"
                        />
                      </div>
                    ))}
                  </div>
                )
              })()}
              
              <div className="bg-surface-container-low p-4 rounded-xl">
                {(() => {
                  const activePlayers = players.filter(p => p.isActive)
                  
                  // Calculate dynamic math including pending cashouts
                  let dynamicPositive = totalPositive
                  let dynamicNegative = totalNegative

                  activePlayers.forEach(p => {
                    const inputVal = pendingCashOuts[p.id]
                    // If no input yet, we don't assume 0 immediately to not confuse the user, 
                    // or maybe we do. Let's only add if it's not undefined.
                    if (inputVal !== undefined && inputVal !== "") {
                      const cv = parseFloat(inputVal) || 0
                      const net = cv - p.totalBuyIn
                      if (net > 0) dynamicPositive += net
                      if (net < 0) dynamicNegative += net
                    }
                  })

                  const rake = parseFloat(rakeAmount) || 0
                  const balance = dynamicPositive + dynamicNegative + rake

                  return (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary text-sm">Pot Total de Entradas:</span>
                        <span className="text-primary font-bold">{formatCurrency(totalPot)}</span>
                      </div>
                      <div className="flex justify-between mb-2 border-t border-surface-variant/20 pt-2">
                        <span className="text-secondary text-sm">Soma Fichas Vencedoras (+):</span>
                        <span className="text-green-600 font-bold">+{formatCurrency(dynamicPositive)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary text-sm">Soma Fichas Perdedoras (-):</span>
                        <span className="text-error font-bold">{formatCurrency(dynamicNegative)}</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant/20 pt-2">
                        <span className="text-secondary text-sm font-bold">Saldo do Caixa s/ Rake:</span>
                        <span className={cn(
                          "font-bold",
                          dynamicPositive + dynamicNegative < 0 ? "text-error" : "text-primary"
                        )}>
                          {formatCurrency(dynamicPositive + dynamicNegative)}
                        </span>
                      </div>
                    </>
                  )
                })()}
              </div>

              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  RAKE ARRECADADO (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 150"
                  value={rakeAmount}
                  onChange={(e) => setRakeAmount(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Math Check */}
              {(() => {
                const activePlayers = players.filter(p => p.isActive)
                let dynamicPositive = totalPositive
                let dynamicNegative = totalNegative

                activePlayers.forEach(p => {
                  const inputVal = pendingCashOuts[p.id]
                  if (inputVal !== undefined && inputVal !== "") {
                    const cv = parseFloat(inputVal) || 0
                    const net = cv - p.totalBuyIn
                    if (net > 0) dynamicPositive += net
                    if (net < 0) dynamicNegative += net
                  }
                })

                const rake = parseFloat(rakeAmount) || 0
                const balance = dynamicPositive + dynamicNegative + rake
                
                return (
                  <div className={cn(
                    "p-4 rounded-xl border",
                    Math.abs(balance) < 1
                      ? "bg-tertiary-container/30 border-tertiary-container/50"
                      : "bg-error-container/30 border-error-container/50"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "material-symbols-outlined text-lg",
                        Math.abs(balance) < 1 ? "text-on-tertiary-container" : "text-error"
                      )}>
                        {Math.abs(balance) < 1 ? "check_circle" : "warning"}
                      </span>
                      <span className={cn(
                        "font-bold text-sm",
                        Math.abs(balance) < 1 ? "text-on-tertiary-container" : "text-error"
                      )}>
                        {Math.abs(balance) < 1 ? "Caixa Batido!" : "Atenção ao Caixa"}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs leading-tight",
                      Math.abs(balance) < 1 ? "text-on-tertiary-container/80" : "text-error/80"
                    )}>
                      {Math.abs(balance) < 1 
                        ? "A matemática confere com as saídas e entradas."
                        : balance < 0 
                          ? `Está faltando ${formatCurrency(Math.abs(balance))} no caixa para a conta fechar.`
                          : `Está sobrando ${formatCurrency(balance)} no caixa de acordo com a conta.`}
                    </p>
                  </div>
                )
              })()}

              {(() => {
                const activePlayers = players.filter(p => p.isActive)
                const hasMissingCashouts = activePlayers.some(p => pendingCashOuts[p.id] === undefined || pendingCashOuts[p.id] === "")
                
                return (
                  <button
                    onClick={handleCloseSession}
                    disabled={isSubmitting || hasMissingCashouts}
                    className="w-full bg-error-container text-on-error-container py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50 mt-4 disabled:cursor-not-allowed"
                  >
                    Confirmar Encerramento
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Success Modal Ask for Receipt */}
      {sessionClosedSuccessfully && !showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-3xl ios-shadow border border-surface-variant/20 animate-in zoom-in-95 duration-200 text-center">
            <div className="p-6 md:p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-green-600">check</span>
              </div>
              <h3 className="text-title-lg text-primary font-bold mb-2">Mesa Finalizada!</h3>
              <p className="text-body-sm text-secondary mb-8">
                A sessão foi encerrada com sucesso. O caixa foi fechado e os resultados salvos. Deseja gerar um comprovante com os resultados finais para enviar no grupo?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                  Sim, Gerar Comprovante
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-surface-container-high text-primary py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                  Não, Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rebuy Approval */}
      {showApproveModal && selectedPendingRebuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container w-full max-w-[320px] rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200 border border-surface-variant/20">
            <h3 className="text-xl font-bold text-primary mb-2 text-center">Aprovar Re-buy</h3>
            <p className="text-secondary text-center mb-6">
              Confirmar Re-buy de <strong className="text-primary">{formatCurrency(selectedPendingRebuy.pendingRebuyAmount || 0)}</strong> para <strong className="text-primary">{selectedPendingRebuy.name}</strong>?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleApproveRebuy("APPROVE")}
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Processando..." : "Confirmar Re-buy"}
              </button>
              <button
                onClick={() => handleApproveRebuy("REJECT")}
                disabled={isSubmitting}
                className="w-full bg-surface-container-high hover:bg-surface-variant text-error py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Recusar Solicitação
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedPendingRebuy(null)
                }}
                disabled={isSubmitting}
                className="w-full py-3 text-secondary font-bold hover:text-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
