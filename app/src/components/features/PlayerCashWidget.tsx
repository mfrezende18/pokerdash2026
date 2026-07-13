"use client"

import { useState } from "react"
import { cn, formatCurrency } from "@/lib/utils"

interface TableTransaction {
  id: string
  type: "buyin" | "rebuy"
  amount: number
  timestamp: Date
}

interface PlayerCashWidgetProps {
  transactions: TableTransaction[]
  sessionName: string
}

export function PlayerCashWidget({ transactions, sessionName }: PlayerCashWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (transactions.length === 0) return null

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const rebuyCount = transactions.filter(t => t.type === "rebuy").length

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-4 z-50",
          "flex items-center gap-2",
          "bg-orange-500 hover:bg-orange-600 active:scale-95",
          "text-white font-bold",
          "px-4 py-3 rounded-full",
          "shadow-lg shadow-orange-500/30",
          "transition-all duration-200",
          isOpen && "ring-2 ring-orange-300 ring-offset-2"
        )}
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          paid
        </span>
        <span className="text-sm font-bold tabular-nums">
          {formatCurrency(totalSpent)}
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div className="fixed bottom-44 right-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl apple-shadow border border-surface-variant/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="bg-orange-500 p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-100 text-xs font-medium uppercase tracking-wider mb-1">
                    Meu Caixa na Mesa
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-white text-sm">close</span>
                </button>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="bg-white/15 rounded-lg px-3 py-1.5 text-xs font-bold">
                  <span className="text-orange-100 mr-1">Buy-in:</span>
                  {formatCurrency(transactions.find(t => t.type === "buyin")?.amount ?? 0)}
                </div>
                {rebuyCount > 0 && (
                  <div className="bg-white/15 rounded-lg px-3 py-1.5 text-xs font-bold">
                    <span className="text-orange-100 mr-1">Rebuys:</span>
                    {rebuyCount}x
                  </div>
                )}
              </div>
            </div>

            {/* Session name */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs text-secondary font-medium truncate">
                {sessionName.replace("Sessão Oficial - ", "📍 ")}
              </p>
            </div>

            {/* Timeline */}
            <div className="px-5 pb-5">
              <div className="space-y-0">
                {transactions.map((t, i) => {
                  const isLast = i === transactions.length - 1

                  return (
                    <div key={t.id} className="flex gap-3">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                          t.type === "buyin"
                            ? "bg-orange-500"
                            : "bg-amber-400"
                        )} />
                        {!isLast && (
                          <div className="w-px h-full bg-surface-variant/40 min-h-[28px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-semibold text-primary">
                            {t.type === "buyin"
                              ? "Entrada na Mesa"
                              : `Rebuy #${transactions.filter((tx, j) => tx.type === "rebuy" && j <= i).length}`
                            }
                          </p>
                          <span className="text-xs font-bold text-orange-600 tabular-nums">
                            {formatCurrency(t.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-0.5">
                          {formatTime(t.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
