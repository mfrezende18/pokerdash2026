"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface InviteFormProps {
  token: string
  playerName: string
}

export function InviteForm({ token, playerName }: InviteFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao criar conta")
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-[90vw] max-w-[480px]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-primary text-3xl">
              how_to_reg
            </span>
          </div>
          <h1 className="text-headline-lg text-primary">Bem-vindo!</h1>
          <p className="text-body-lg text-secondary mt-2">
            Olá <strong>{playerName}</strong>, crie sua conta para acessar seu
            dashboard pessoal e todo seu histórico de jogo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-label-caps text-secondary mb-2 block text-[11px]">
              E-MAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-surface-container-lowest text-primary focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <label className="text-label-caps text-secondary mb-2 block text-[11px]">
              CRIAR SENHA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-surface-container-lowest text-primary focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <label className="text-label-caps text-secondary mb-2 block text-[11px]">
              CONFIRMAR SENHA
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
              className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-surface-container-lowest text-primary focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-error-container/40 text-error px-4 py-3 rounded-xl text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  )
}
