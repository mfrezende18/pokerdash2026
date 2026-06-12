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
}

interface RankingListProps {
  rankings: RankingItem[]
}

const medals = ["🥇", "🥈", "🥉"]

export function RankingList({ rankings }: RankingListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const top5 = rankings.slice(0, 5)

  const renderPlayerRow = (player: RankingItem, index: number) => (
    <div
      key={player.id}
      className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-xl transition-all group"
    >
      <Link href={`/stats/${player.id}`} className="flex items-center gap-6 group/link">
        <span className="text-2xl w-8 text-center">
          {index < 3 ? medals[index] : `${index + 1}º`}
        </span>
        {player.avatarUrl ? (
          player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
            <Image
              src={player.avatarUrl}
              alt={player.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover group-hover/link:ring-2 ring-primary transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-sm group-hover/link:ring-2 ring-primary transition-all">
              {player.avatarUrl}
            </div>
          )
        ) : (
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover/link:ring-2 ring-primary transition-all">
            <span className="font-bold text-secondary">
              {player.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h5 className="text-base font-semibold text-primary leading-tight group-hover/link:underline">
            {player.name}
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
