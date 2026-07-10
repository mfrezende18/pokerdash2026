"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function ToggleRakeButton({ initialValue }: { initialValue: boolean }) {
  const [showRake, setShowRake] = useState(initialValue)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = async () => {
    // Optimistic update
    setShowRake(!showRake)
    
    try {
      const res = await fetch("/api/settings/toggle-rake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: showRake }),
      })
      
      if (!res.ok) {
        // Revert on error
        setShowRake(showRake)
        alert("Erro ao alterar visibilidade do Rake")
      } else {
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (e) {
      // Revert on error
      setShowRake(showRake)
      alert("Erro de conexão")
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`absolute top-6 right-6 w-12 h-6 rounded-full flex items-center px-1 transition-colors ${showRake ? "bg-primary" : "bg-surface-variant/50"} ${isPending ? "opacity-50" : ""}`}
      title="Visibilidade do Rake para os Jogadores"
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showRake ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  )
}
