import { formatCurrency } from "@/lib/utils"

export interface SessionEvent {
  id: string
  message: string
  timestamp: Date
}

interface SessionLogConsoleProps {
  events: SessionEvent[]
}

export function SessionLogConsole({ events }: SessionLogConsoleProps) {
  if (events.length === 0) return null

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 bg-[#0a0a0a] rounded-2xl border border-[#333] shadow-inner overflow-hidden flex flex-col font-mono">
      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-[#888] text-xs font-bold tracking-widest uppercase">System Log</span>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto space-y-2 text-sm">
        {events.map((ev) => (
          <div key={ev.id} className="flex gap-4 items-start border-b border-[#222] pb-2 last:border-0 last:pb-0">
            <span className="text-[#666] shrink-0">
              [{new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(ev.timestamp))}]
            </span>
            <span className="text-green-400">
              {ev.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function buildSessionEvents(session: any): SessionEvent[] {
  const allEvents: SessionEvent[] = []
  const rebuyCounts: Record<string, number> = {}

  for (const b of session.buyIns || []) {
    if (b.status === "PENDING") {
      allEvents.push({
        id: b.id + "-pending",
        timestamp: b.createdAt,
        message: `${b.player?.name} solicitou re-buy de ${formatCurrency(b.amount)}`,
      })
      continue
    }
    
    if (b.status === "REJECTED") {
      allEvents.push({
        id: b.id + "-rejected",
        timestamp: b.updatedAt,
        message: `❌ Solicitação de re-buy de ${b.player?.name} foi recusada`,
      })
      continue
    }

    if (b.type === "INITIAL") {
      allEvents.push({
        id: b.id,
        timestamp: b.createdAt,
        message: `${b.player?.name} entrou no jogo: buy-in ${formatCurrency(b.amount)}`,
      })
    } else {
      // APPROVED
      const isRequested = Math.abs(new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime()) > 1000
      
      if (isRequested) {
        allEvents.push({
          id: b.id + "-pending-history",
          timestamp: b.createdAt,
          message: `${b.player?.name} solicitou re-buy de ${formatCurrency(b.amount)}`,
        })
      }
      rebuyCounts[b.playerId] = (rebuyCounts[b.playerId] || 0) + 1
      const count = rebuyCounts[b.playerId]
      if (count === 1) {
        allEvents.push({
          id: b.id,
          timestamp: b.updatedAt,
          message: `✅ re-buy para o ${b.player?.name} ${formatCurrency(b.amount)}`,
        })
      } else {
        allEvents.push({
          id: b.id,
          timestamp: b.updatedAt,
          message: `✅ ${count}º re-buy ${b.player?.name} ${formatCurrency(b.amount)}`,
        })
      }
    }
  }

  for (const c of session.cashOuts || []) {
    allEvents.push({
      id: c.id,
      timestamp: c.createdAt,
      message: `${c.player?.name} fez cash-out de ${formatCurrency(c.chipValue)}`,
    })
  }

  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return allEvents
}
