"use client"

import { useState, Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn, formatCurrency, formatPercent } from "@/lib/utils"

interface RankingItem {
  id: string
  name: string
  avatarUrl: string | null
  winRateVal: number
  winRateText: string
  isTourist: boolean
  roi: number
  totalProfit: number
  totalSessions: number
  totalInvested: number
}

interface RankingTableClientProps {
  initialRankings: RankingItem[]
}

type SortKey = "winRateVal" | "totalSessions" | "totalInvested" | "totalProfit" | "roi"
type SortOrder = "asc" | "desc"

const medals = ["🥇", "🥈", "🥉"]

export function RankingTableClient({ initialRankings }: RankingTableClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>("winRateVal")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  const sortedRankings = [...initialRankings].sort((a, b) => {
    // 1ª Divisão (Regulares) sempre acima da 2ª Divisão (Turistas)
    if (a.isTourist !== b.isTourist) {
      return a.isTourist ? 1 : -1
    }

    // Ordenação dentro da divisão
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    
    // Desempate por lucro
    return b.totalProfit - a.totalProfit
  })

  const firstTouristIndex = sortedRankings.findIndex(p => p.isTourist)

  return (
    <div className="bg-surface-container-lowest rounded-2xl apple-shadow border border-surface-variant/20 overflow-hidden">
      <div className="p-6 card-divider">
        <h3 className="text-title-md text-primary">Classificação Completa</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-label-caps text-secondary border-b border-surface-variant/20 select-none">
              <th className="px-6 py-4 font-bold text-[11px]">#</th>
              <th className="px-6 py-4 font-bold text-[11px]">JOGADOR</th>
              <th 
                className="px-6 py-4 font-bold text-[11px] cursor-pointer hover:text-primary transition-colors group"
                onClick={() => handleSort("winRateVal")}
              >
                WIN RATE {sortKey === "winRateVal" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th 
                className="px-6 py-4 font-bold text-[11px] cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort("totalSessions")}
              >
                SESSÕES {sortKey === "totalSessions" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th 
                className="px-6 py-4 font-bold text-[11px] cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort("totalInvested")}
              >
                INVESTIDO {sortKey === "totalInvested" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th 
                className="px-6 py-4 font-bold text-right text-[11px] cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort("totalProfit")}
              >
                LUCRO {sortKey === "totalProfit" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th 
                className="px-6 py-4 font-bold text-right text-[11px] cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSort("roi")}
              >
                ROI {sortKey === "roi" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {sortedRankings.map((player, index) => {
              const showTouristHeader = player.isTourist && index === firstTouristIndex
              
              return (
                <Fragment key={player.id}>
                  {showTouristHeader && (
                    <tr className="bg-surface-container-high/50">
                      <td colSpan={7} className="px-6 py-3 text-center">
                        <span className="text-label-caps text-secondary font-bold tracking-widest text-[11px]">
                          ↓ OS TURISTAS (2ª DIVISÃO) ↓
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 text-lg">
                      {index < 3 && !player.isTourist ? medals[index] : `${index + 1}º`}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/stats/${player.id}`} className="flex items-center gap-3 group/link">
                        {player.avatarUrl ? (
                          player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
                            <Image
                              src={player.avatarUrl}
                              alt={player.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover group-hover/link:ring-2 ring-primary transition-all"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-lg shadow-sm group-hover/link:ring-2 ring-primary transition-all">
                              {player.avatarUrl}
                            </div>
                          )
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center group-hover/link:ring-2 ring-primary transition-all">
                            <span className="text-xs font-bold text-secondary">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-semibold text-primary text-sm group-hover/link:underline">
                          {player.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-mono-data text-primary font-bold">
                      {player.winRateText} <span className="text-xs text-secondary ml-1 font-normal">({formatPercent(player.winRateVal)})</span>
                    </td>
                    <td className="px-6 py-4 text-mono-data text-secondary">
                      {player.totalSessions}
                    </td>
                    <td className="px-6 py-4 text-mono-data text-secondary">
                      {formatCurrency(player.totalInvested)}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-mono-data text-right font-bold",
                        player.totalProfit >= 0
                          ? "text-on-tertiary-container"
                          : "text-error"
                      )}
                    >
                      {player.totalProfit > 0 ? "+" : ""}
                      {formatCurrency(player.totalProfit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          "text-mono-data text-xs px-3 py-1 rounded-full font-bold",
                          player.roi >= 5
                            ? "text-green-700 bg-green-50"
                            : player.roi >= 0
                            ? "text-secondary bg-surface-container"
                            : "text-error bg-error-container/40"
                        )}
                      >
                        {formatPercent(player.roi)}
                      </span>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
