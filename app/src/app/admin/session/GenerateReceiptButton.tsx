"use client"

import { useState, useRef } from "react"
import { toPng } from "html-to-image"
import { ReceiptTable } from "@/components/features/ReceiptTable"
import { format } from "date-fns"

export function GenerateReceiptButton({ session }: { session: any }) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (!receiptRef.current) return
    setIsGenerating(true)
    try {
      const dataUrl = await toPng(receiptRef.current, { quality: 1, backgroundColor: "#000" })
      const fileName = `Comprovante-${session.name?.replace(/\s+/g, "-") || "Sessao"}.png`
      
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], fileName, { type: blob.type })
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'Comprovante de Sessão', files: [file] })
          setIsGenerating(false)
          return
        }
      } catch (e) {
        console.log("Share API unavailable")
      }

      const link = document.createElement("a")
      link.download = fileName
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
       console.error(error)
       alert("Erro ao gerar imagem. Verifique se o navegador suporta este recurso.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate players
  const playersMap = new Map()
  session.buyIns.forEach((b: any) => {
    if (b.status !== "APPROVED") return
    if (!playersMap.has(b.playerId)) {
      playersMap.set(b.playerId, { id: b.player.id, name: b.player.name, buyInRecords: [], totalBuyIn: 0, cashOutValue: 0 })
    }
    const p = playersMap.get(b.playerId)
    p.buyInRecords.push(b.amount)
    p.totalBuyIn += b.amount
  })
  session.cashOuts.forEach((c: any) => {
    if (playersMap.has(c.playerId)) {
      playersMap.get(c.playerId).cashOutValue = c.chipValue
    }
  })

  const playersList = Array.from(playersMap.values())
  playersList.forEach((p: any) => { p.netResult = p.cashOutValue - p.totalBuyIn })
  const sortedPlayers = playersList.sort((a,b) => b.netResult - a.netResult)

  const receiptPlayers = sortedPlayers.map((p: any) => ({
    id: p.id,
    name: p.name,
    buyIn: p.buyInRecords[0] || 0,
    rebuys: p.buyInRecords.slice(1),
    totalSpent: p.totalBuyIn,
    cashOut: p.cashOutValue,
    profit: p.netResult > 0 ? p.netResult : 0,
    loss: p.netResult < 0 ? p.netResult : 0
  }))

  const totalPot = playersList.reduce((sum, p: any) => sum + p.totalBuyIn, 0)
  const totalPositive = playersList.filter((p: any) => p.netResult > 0).reduce((sum, p: any) => sum + p.netResult, 0)
  const totalNegative = playersList.filter((p: any) => p.netResult < 0).reduce((sum, p: any) => sum + p.netResult, 0)
  const rake = session.rakeCollected || 0

  return (
    <>
      <button 
        onClick={handleDownload}
        disabled={isGenerating}
        className="text-secondary hover:text-primary transition-colors p-2 flex items-center justify-center disabled:opacity-50"
        title="Gerar Comprovante"
      >
        <span className="material-symbols-outlined text-xl">
          {isGenerating ? "hourglass_empty" : "receipt_long"}
        </span>
      </button>

      {/* Hidden Receipt Element */}
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none overflow-hidden">
        <div className="min-w-max border-4 border-black rounded-lg overflow-hidden">
          <ReceiptTable 
            ref={receiptRef}
            date={format(new Date(session.closedAt || session.startedAt), "dd/MM/yyyy")}
            locationName={session.name?.split("-")?.[1]?.trim() || "Poker Dash"}
            players={receiptPlayers}
            rake={rake}
            totalPot={totalPot}
            totalPositive={totalPositive}
            totalNegative={totalNegative}
            isMathCorrect={Math.abs(totalPositive + totalNegative + rake) < 1}
          />
        </div>
      </div>
    </>
  )
}
