"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn, formatCurrency } from "@/lib/utils"

interface RankingItem {
  id: string
  name: string
  avatarUrl: string | null
  netResult: number
  badge?: "inactive" | "streak" | null
  streakCount?: number
  positionDelta?: number | null
}

interface RankingListProps {
  rankings: RankingItem[]
}

const medals = ["🥇", "🥈", "🥉"]

export function RankingList({ rankings }: RankingListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const top5 = rankings.slice(0, 5)

  const renderPlayerRow = (player: RankingItem, index: number) => {
    const isInactive = player.badge === "inactive"
    const isStreak = player.badge === "streak"

    return (
      <div
        key={player.id}
        className={cn(
          "flex items-center justify-between p-3 hover:bg-surface-container-low rounded-xl transition-all group",
          isInactive && "opacity-75"
        )}
      >
        <Link href={`/stats/${player.id}`} className="flex items-center gap-6 group/link">
          <span className="text-2xl w-8 text-center">
            {index < 3 ? medals[index] : `${index + 1}º`}
          </span>

          {/* Avatar with badge */}
          <div className="relative">
            {player.avatarUrl ? (
              player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
                <Image
                  src={player.avatarUrl}
                  alt={player.name}
                  width={48}
                  height={48}
                  className={cn(
                    "w-12 h-12 rounded-full object-cover group-hover/link:ring-2 ring-primary transition-all",
                    isInactive && "grayscale-[40%]"
                  )}
                />
              ) : (
                <div className={cn(
                  "w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-sm group-hover/link:ring-2 ring-primary transition-all",
                  isInactive && "opacity-80"
                )}>
                  {player.avatarUrl}
                </div>
              )
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover/link:ring-2 ring-primary transition-all",
                isInactive && "opacity-80"
              )}>
                <span className="font-bold text-secondary">
                  {player.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Activity badge on avatar */}
            {isInactive && (
              <span className="absolute -top-1 -right-1 text-sm" title="Jogador inativo">🥶</span>
            )}
            {isStreak && (player.streakCount ?? 0) >= 2 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full shadow-sm leading-none flex items-center" title={`${player.streakCount} vitórias seguidas`}>
                {player.streakCount}🔥
              </span>
            )}
          </div>

          <div>
            <h5 className="text-base font-semibold text-primary leading-tight group-hover/link:underline flex items-center gap-1.5">
              {player.name}
              {/* Position arrow */}
              {player.positionDelta !== undefined && player.positionDelta !== null && player.positionDelta < 0 && (
                <span className="text-green-600 text-xs font-bold">↑</span>
              )}
              {player.positionDelta !== undefined && player.positionDelta !== null && player.positionDelta > 0 && (
                <span className="text-red-500 text-xs font-bold">↓</span>
              )}
              {player.positionDelta === 0 && (
                <span className="text-secondary/50 text-xs">—</span>
              )}
            </h5>
          </div>
        </Link>

        <div className="text-right">
          <span
            className={cn(
              "text-mono-data text-sm font-bold",
              player.netResult >= 0 ? "text-green-600" : "text-error"
            )}
          >
            {player.netResult > 0 ? "+" : ""}
            {formatCurrency(player.netResult)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-6 apple-shadow border border-surface-variant/20 h-full">
        <div className="flex justify-between items-center mb-6 card-divider pb-3">
          <h3 className="text-title-md text-primary">Ranking da Última Sessão</h3>
          {rankings.length > 5 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary font-bold text-sm hover:opacity-70 transition-opacity"
            >
              Ver Todos
            </button>
          )}
        </div>

        <div className="space-y-1">
          {top5.map((player, index) => renderPlayerRow(player, index))}

          {rankings.length === 0 && (
            <p className="text-center text-secondary py-8 text-body-sm">
              Nenhuma sessão registrada ainda
            </p>
          )}
        </div>
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface-container-lowest w-[90vw] max-w-[500px] max-h-[85vh] rounded-3xl apple-shadow border border-surface-variant/20 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-variant/20 flex justify-between items-center bg-surface-container-low/50">
              <h3 className="text-title-lg text-primary font-semibold">Última Sessão Completa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-1 flex-1">
              {rankings.map((player, index) => renderPlayerRow(player, index))}
            </div>
            
            <div className="p-4 border-t border-surface-variant/20 bg-surface-container-low/50 text-center">
              <Link 
                href="/rankings" 
                className="text-sm font-semibold text-primary hover:underline"
              >
                Acessar Histórico Global
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
