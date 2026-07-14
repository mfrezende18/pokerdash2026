"use client"

import { useState } from "react"
import { SessionLogConsole, buildSessionEvents } from "@/components/features/SessionLogConsole"

export function ViewSessionLogsModal({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-secondary hover:text-primary transition-colors p-2 flex items-center justify-center"
        title="Ver Logs do Sistema"
      >
        <span className="material-symbols-outlined text-xl">terminal</span>
      </button>
    )
  }

  let events = []
  if (session.systemLog) {
    try {
      events = JSON.parse(session.systemLog)
    } catch {
      events = buildSessionEvents(session)
    }
  } else {
    events = buildSessionEvents(session)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-secondary hover:text-primary transition-colors p-2 flex items-center justify-center"
        title="Ver Logs do Sistema"
      >
        <span className="material-symbols-outlined text-xl">terminal</span>
      </button>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
        <div 
          className="bg-surface-container-lowest w-full max-w-[800px] max-h-[85vh] rounded-3xl apple-shadow border border-surface-variant/20 flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-surface-variant/20 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="text-title-lg text-primary font-semibold">Logs da Sessão: {session.name}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-sm">close</span>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto bg-[#0a0a0a]">
            <SessionLogConsole events={events} />
          </div>
        </div>
      </div>
    </>
  )
}
