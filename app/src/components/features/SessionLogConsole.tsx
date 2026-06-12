import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SessionEvent {
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
              [{format(ev.timestamp, "HH:mm")}]
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
