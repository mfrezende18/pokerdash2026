"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja apagar esta mesa? Todos os registros financeiros dela serão apagados e não farão mais parte da dashboard.")) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        startTransition(() => {
          router.refresh()
        })
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao apagar mesa")
      }
    } catch (e) {
      alert("Erro de conexão")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || isPending}
      className="text-error bg-error/10 hover:bg-error/20 p-2 rounded-lg flex items-center transition-colors ml-2 disabled:opacity-50"
      title="Apagar Mesa (Admin 1)"
    >
      <span className="material-symbols-outlined text-[20px]">delete</span>
    </button>
  )
}
