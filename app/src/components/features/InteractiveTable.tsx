"use client"

import { useState } from "react"
import Image from "next/image"
import { cn, formatCurrency } from "@/lib/utils"
import { addPlayerToSession, addRebuyToSession, removePlayerFromSession, cashOutPlayerFromSession } from "@/app/actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PlayerData {
  id: string
  name: string
  avatarUrl: string | null
  totalSpent: number
  rebuyCount: number
  joinedAt: Date
}

interface SessionInfo {
  id: string
  name: string
  totalPot: number
  playerCount: number
  startedAt: Date
}

interface UserData {
  id: string
  name: string
}

interface InteractiveTableProps {
  sessionInfo: SessionInfo
  activePlayers: PlayerData[]
  allUsers: UserData[]
  isAdmin: boolean
}

// 10 Seats coordinates mapping (Mobile vertical table vs Desktop horizontal table)
const seatClasses = [
  "top-[15%] left-[0%] md:top-[30%] md:left-[2%]",
  "top-[50%] left-[-5%] md:top-[70%] md:left-[2%]",
  "top-[85%] left-[0%] md:top-[0%] md:left-[20%]",
  "top-[0%] left-[30%] md:top-[0%] md:left-[50%]",
  "top-[0%] left-[70%] md:top-[0%] md:left-[80%]",
  "top-[15%] left-[100%] md:top-[30%] md:left-[98%]",
  "top-[50%] left-[105%] md:top-[70%] md:left-[98%]",
  "top-[85%] left-[100%] md:top-[100%] md:left-[80%]",
  "top-[100%] left-[70%] md:top-[100%] md:left-[50%]",
  "top-[100%] left-[30%] md:top-[100%] md:left-[20%]"
]

export function InteractiveTable({ sessionInfo, activePlayers, allUsers, isAdmin }: InteractiveTableProps) {
  const [popoverState, setPopoverState] = useState<{
    isOpen: boolean;
    seatIndex: number | null;
    player: PlayerData | null;
  }>({ isOpen: false, seatIndex: null, player: null })

  const [buyInAmount, setBuyInAmount] = useState<number>(200)
  const [cashOutAmount, setCashOutAmount] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  // Criar array fixo de 10 posições
  const seats = Array.from({ length: 10 }).map((_, i) => activePlayers[i] || null)

  const handleSeatClick = (index: number, player: PlayerData | null) => {
    if (!isAdmin && !player) return // Users can't click empty seats
    
    setPopoverState({
      isOpen: true,
      seatIndex: index,
      player
    })
  }

  const closePopover = () => setPopoverState({ isOpen: false, seatIndex: null, player: null })

  const handleAddPlayer = async () => {
    if (!selectedUserId || buyInAmount <= 0) return
    const userId = selectedUserId
    const amount = buyInAmount
    closePopover()
    setSelectedUserId("")
    await addPlayerToSession(sessionInfo.id, userId, amount)
  }

  const handleAddRebuy = async () => {
    if (!popoverState.player || buyInAmount <= 0) return
    const playerId = popoverState.player.id
    const amount = buyInAmount
    closePopover()
    await addRebuyToSession(sessionInfo.id, playerId, amount)
  }

  const handleRemovePlayer = async () => {
    if (!popoverState.player) return
    const playerId = popoverState.player.id
    closePopover()
    await removePlayerFromSession(sessionInfo.id, playerId)
  }

  const handleCashOutPlayer = async () => {
    if (!popoverState.player || cashOutAmount === "") return
    const playerId = popoverState.player.id
    const amount = Number(cashOutAmount)
    closePopover()
    setCashOutAmount("")
    await cashOutPlayerFromSession(sessionInfo.id, playerId, amount)
  }

  // Filtrar usuários que já estão sentados
  const availableUsers = allUsers.filter(u => !activePlayers.some(ap => ap.id === u.id))

  return (
    <section className="relative flex flex-col items-center justify-center my-16">
      
      {/* Mesa (CSS Shape) */}
      <div className="relative w-full max-w-[320px] md:max-w-[800px] aspect-[1/1.6] md:aspect-[2.2/1] rounded-[100px] md:rounded-[200px] bg-green-700 border-[20px] md:border-[28px] border-amber-900 shadow-2xl flex items-center justify-center apple-shadow-lg">
        
        {/* Linha interna branca da mesa */}
        <div className="absolute inset-4 md:inset-6 rounded-[80px] md:rounded-[150px] border-[2px] border-white/20 pointer-events-none" />
        
        {/* Centro da Mesa: Infos do Pote */}
        <div className="relative z-10 flex flex-col items-center text-center p-4">
          <p className="text-white/70 text-[10px] md:text-xs font-medium tracking-widest uppercase mb-1">
            {format(new Date(sessionInfo.startedAt), "dd/MM/yyyy - HH:mm")}
          </p>
          <p className="text-white/90 text-xs md:text-sm mb-3">
            JOGADORES ATIVOS: <span className="font-bold text-white">{sessionInfo.playerCount}</span>
          </p>
          
          <div className="w-16 h-[1px] bg-white/20 mb-3" />
          
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-md">
            {formatCurrency(sessionInfo.totalPot)}
          </h2>
          <p className="text-green-300 font-medium text-xs mt-1 uppercase tracking-widest">
            Pot Total
          </p>
        </div>

        {/* Assentos */}
        {seats.map((player, index) => (
          <div
            key={index}
            onClick={() => handleSeatClick(index, player)}
            className={cn(
              "absolute w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all border-4 shadow-lg",
              seatClasses[index],
              player ? "bg-surface-container border-primary hover:scale-105" : "bg-black/40 border-white/10 hover:border-white/40 border-dashed backdrop-blur-sm"
            )}
            style={{ zIndex: popoverState.seatIndex === index ? 40 : 20 }}
          >
            {player ? (
              <div className="flex flex-col items-center justify-center w-full h-full rounded-full overflow-hidden bg-surface-container-high relative">
                {player.avatarUrl ? (
                  player.avatarUrl.startsWith("http") || player.avatarUrl.startsWith("/") ? (
                    <Image src={player.avatarUrl} alt={player.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl md:text-3xl bg-secondary-container">
                      {player.avatarUrl}
                    </div>
                  )
                ) : (
                  <span className="font-bold text-lg md:text-xl text-primary">{player.name.charAt(0)}</span>
                )}
                {/* Nome overlay */}
                <div className="absolute bottom-0 w-full bg-black/70 text-center py-[2px]">
                  <span className="text-[8px] md:text-[10px] text-white font-bold block truncate px-1">
                    {player.name}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-white/40">VAZIO</span>
            )}
          </div>
        ))}
      </div>

      {/* Popover / Modal Overlay */}
      {popoverState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closePopover}>
          <div 
            className="bg-surface-container-lowest w-[90vw] max-w-[420px] rounded-3xl p-8 apple-shadow border border-surface-variant/20 flex flex-col gap-6"
            onClick={e => e.stopPropagation()}
          >
            {popoverState.player ? (
              // Ocupado
              <>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-primary overflow-hidden relative">
                    {popoverState.player.avatarUrl ? (
                      popoverState.player.avatarUrl.startsWith("http") || popoverState.player.avatarUrl.startsWith("/") ? (
                        <Image src={popoverState.player.avatarUrl} alt={popoverState.player.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-3xl bg-secondary-container">
                          {popoverState.player.avatarUrl}
                        </div>
                      )
                    ) : (
                      <span className="font-bold text-2xl text-primary">{popoverState.player.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-title-lg text-primary">{popoverState.player.name}</h3>
                    <p className="text-body-sm text-secondary">Na mesa desde as {format(new Date(popoverState.player.joinedAt), "HH:mm")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-2xl">
                  <div>
                    <p className="text-label-sm text-secondary mb-1">Re-buys</p>
                    <p className="text-title-md font-bold text-primary">{popoverState.player.rebuyCount}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-secondary mb-1">Total Gasto</p>
                    <p className="text-title-md font-bold text-error">{formatCurrency(popoverState.player.totalSpent)}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="bg-surface-container-low p-3 rounded-xl space-y-3 border border-surface-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold w-16">Re-buy:</span>
                        <input 
                          type="number" 
                          value={buyInAmount}
                          onChange={e => setBuyInAmount(Number(e.target.value))}
                          className="flex-1 bg-surface-container border border-surface-variant rounded-lg p-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                      </div>
                      <button onClick={handleAddRebuy} className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90 text-sm">
                        Adicionar Re-buy
                      </button>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-xl space-y-3 border border-surface-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold w-16">Fichas:</span>
                        <input 
                          type="number" 
                          placeholder="Ex: 0 ou 500"
                          value={cashOutAmount}
                          onChange={e => setCashOutAmount(e.target.value)}
                          className="flex-1 bg-surface-container border border-surface-variant rounded-lg p-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                      </div>
                      <button 
                        onClick={handleCashOutPlayer} 
                        disabled={cashOutAmount === ""}
                        className="w-full bg-tertiary-container text-on-tertiary-container py-2.5 rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90 text-sm disabled:opacity-50"
                      >
                        Fazer Cash-out (Sair da mesa)
                      </button>
                    </div>

                    <button onClick={handleRemovePlayer} className="w-full bg-error-container text-error py-2.5 rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90 text-xs mt-2 border border-error/20">
                      Excluir Jogador (Engano/Mock)
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Vazio
              <>
                <h3 className="text-title-lg text-primary text-center">Adicionar Jogador</h3>
                <p className="text-body-sm text-secondary text-center -mt-4">Escolha um jogador para sentar neste lugar.</p>
                
                <div className="flex flex-col gap-4">
                  <select 
                    value={selectedUserId} 
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full bg-surface-container border border-surface-variant rounded-xl p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecione um jogador...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-body-sm">Buy-in Inicial (R$):</span>
                    <input 
                      type="number" 
                      value={buyInAmount}
                      onChange={e => setBuyInAmount(Number(e.target.value))}
                      className="flex-1 bg-surface-container border border-surface-variant rounded-lg p-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <button 
                    onClick={handleAddPlayer} 
                    disabled={!selectedUserId}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90 disabled:opacity-50 disabled:active:scale-100"
                  >
                    Sentar na Mesa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
