"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ForcePasswordChangeModal() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      if (res.ok) {
        // Redireciona ou recarrega para atualizar a sessão
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao atualizar senha")
      }
    } catch (err) {
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-[400px] rounded-3xl p-6 sm:p-8 shadow-2xl relative shrink-0 my-auto">
        {/* Decorator */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-tertiary to-primary"></div>
        
        <h2 className="text-title-lg font-bold text-on-surface mb-2 mt-2">Troca de Senha Obrigatória</h2>
        <p className="text-body-md text-secondary mb-6">
          Para sua segurança, defina uma nova senha para acessar o sistema.
        </p>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-label-md text-on-surface mb-2 block font-medium">Nova Senha</label>
            <input
              type="password"
              required
              placeholder="Min. 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-surface-variant/30 text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-secondary"
            />
          </div>

          <div>
            <label className="text-label-md text-on-surface mb-2 block font-medium">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-variant/30 text-on-surface border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 mt-4"
          >
            {isLoading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  )
}
