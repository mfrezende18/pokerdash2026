"use client"

import { useRef, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ReceiptPlayerData {
  id: string
  name: string
  buyIn: number
  rebuys: number[] // array of individual rebuy amounts
  totalSpent: number
  cashOut: number
  profit: number
  loss: number
}

export interface ReceiptTableProps {
  date: string
  locationName: string
  players: ReceiptPlayerData[]
  rake: number
  totalPot: number
  totalPositive: number
  totalNegative: number
  isMathCorrect: boolean
}

export const ReceiptTable = forwardRef<HTMLDivElement, ReceiptTableProps>(
  ({ date, locationName, players, rake, totalPot, totalPositive, totalNegative, isMathCorrect }, ref) => {
    
    // Find max rebuys to determine column span for RE-BUY
    const maxRebuys = Math.max(1, ...players.map(p => p.rebuys.length))
    // We will render exactly 'maxRebuys' columns under the RE-BUY header

    const formatBRL = (val: number) => {
      if (val === 0) return "0"
      return val.toString()
    }

    return (
      <div 
        ref={ref}
        className="bg-black p-6 w-[1000px] text-black font-sans shrink-0"
        style={{ width: 1000 }} // Fixed width to ensure html-to-image captures landscape format perfectly
      >
        <div className="mb-4 text-white font-bold text-lg px-2">
          {date} {locationName}
        </div>
        
        <div className="bg-[#EAEAEA] border-2 border-black">
          {/* Header Row */}
          <div className="flex w-full border-b-2 border-black bg-[#FF3333] text-white font-bold text-xs uppercase tracking-wider text-center h-8 items-center">
            <div className="w-[180px] border-r-2 border-black flex items-center justify-center h-full">NOME</div>
            <div className="w-[80px] border-r-2 border-black flex items-center justify-center h-full">BUY-IN</div>
            <div className="flex-1 border-r-2 border-black flex items-center justify-center h-full">RE-BUY</div>
            <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full">TOTAL GAST.</div>
            <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full">CASHOUT</div>
            <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full">PREJUÍZO</div>
            <div className="w-[100px] flex items-center justify-center h-full">LUCRO</div>
          </div>

          {/* Player Rows */}
          {players.map((p, index) => (
            <div 
              key={p.id} 
              className={cn(
                "flex w-full border-b border-black/40 text-sm font-semibold h-8 items-center",
                index % 2 === 0 ? "bg-[#F3F3F3]" : "bg-[#DEDEDE]"
              )}
            >
              <div className="w-[180px] border-r-2 border-black flex items-center px-2 h-full uppercase truncate">
                {p.name}
              </div>
              <div className="w-[80px] border-r border-black/40 flex items-center justify-center h-full text-[#444]">
                {formatBRL(p.buyIn)}
              </div>
              
              {/* Rebuy columns mapping */}
              <div className="flex-1 border-r-2 border-black flex h-full">
                {Array.from({ length: maxRebuys }).map((_, rIdx) => {
                  const rebuyVal = p.rebuys[rIdx]
                  return (
                    <div 
                      key={rIdx} 
                      className={cn(
                        "flex-1 flex items-center justify-center h-full border-black/40 text-[#444]",
                        rIdx > 0 && "border-l"
                      )}
                    >
                      {rebuyVal !== undefined ? formatBRL(rebuyVal) : ""}
                    </div>
                  )
                })}
              </div>

              <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full text-[#444]">
                {formatBRL(p.totalSpent)}
              </div>
              <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full text-[#444]">
                {formatBRL(p.cashOut)}
              </div>
              <div className="w-[100px] border-r-2 border-black flex items-center justify-center h-full text-[#CC0000] font-bold">
                {p.loss < 0 ? formatBRL(p.loss) : ""}
              </div>
              <div className="w-[100px] flex items-center justify-center h-full text-[#008800] font-bold">
                {p.profit > 0 ? formatBRL(p.profit) : ""}
              </div>
            </div>
          ))}

          {/* Empty rows to fill the table a bit (optional, add 3 just to look nice) */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className={cn(
                "flex w-full border-b border-black/40 h-8 items-center",
                (players.length + index) % 2 === 0 ? "bg-[#F3F3F3]" : "bg-[#DEDEDE]"
              )}
            >
              <div className="w-[180px] border-r-2 border-black h-full"></div>
              <div className="w-[80px] border-r border-black/40 h-full"></div>
              <div className="flex-1 border-r-2 border-black flex h-full">
                {Array.from({ length: maxRebuys }).map((_, rIdx) => (
                  <div key={rIdx} className={cn("flex-1 h-full border-black/40", rIdx > 0 && "border-l")} />
                ))}
              </div>
              <div className="w-[100px] border-r-2 border-black h-full"></div>
              <div className="w-[100px] border-r-2 border-black h-full"></div>
              <div className="w-[100px] border-r-2 border-black h-full"></div>
              <div className="w-[100px] h-full"></div>
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div className="flex justify-between items-start mt-6">
          {/* Left Footer: Rake */}
          <div className="w-[200px]">
            <div className="bg-[#4A88E8] border-2 border-black text-black font-bold text-xs uppercase tracking-wider text-center h-8 flex items-center justify-center">
              RAKE
            </div>
            <div className="bg-white border-2 border-t-0 border-black text-black font-bold text-center h-8 flex items-center justify-center">
              {formatBRL(rake)}
            </div>
          </div>

          {/* Right Footer: Totals */}
          <div className="flex border-2 border-black bg-white">
            <div className="w-[150px] border-r-2 border-black">
              <div className="font-bold text-xs text-center border-b-2 border-black h-8 flex items-center justify-center">
                SOMA
              </div>
              <div className={cn(
                "font-bold text-sm text-center h-8 flex items-center justify-center",
                isMathCorrect ? "text-green-600" : "text-error"
              )}>
                {isMathCorrect ? "✅ CAIXA BATIDO" : "❌ ERRO MATEMÁTICO"}
              </div>
            </div>

            <div className="w-[100px] border-r-2 border-black">
              <div className="font-bold text-xs text-center border-b-2 border-black h-8 flex items-center justify-center">
                TOTAL (-)
              </div>
              <div className="font-bold text-sm text-center h-8 flex items-center justify-center text-[#CC0000]">
                {formatBRL(totalNegative)}
              </div>
            </div>

            <div className="w-[100px] border-r-2 border-black">
              <div className="font-bold text-xs text-center border-b-2 border-black h-8 flex items-center justify-center">
                TOTAL (+)
              </div>
              <div className="font-bold text-sm text-center h-8 flex items-center justify-center text-[#008800]">
                {formatBRL(totalPositive)}
              </div>
            </div>

            <div className="w-[100px]">
              <div className="font-bold text-xs text-center border-b-2 border-black h-8 flex items-center justify-center">
                TOTAL POT
              </div>
              <div className="font-bold text-sm text-center h-8 flex items-center justify-center text-black">
                {formatBRL(totalPot)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ReceiptTable.displayName = "ReceiptTable"
