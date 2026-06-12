"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (val.length > 11) val = val.slice(0, 11)
    
    // Format as (XX) XXXXX-XXXX
    let formatted = val
    if (val.length > 2) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`
    }
    if (val.length > 7) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    }
    
    setPhone(formatted)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      })

      if (res.ok) {
        // Redireciona para home (middleware já cuida do acesso)
        router.push("/")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao fazer login")
      }
    } catch {
      setError("Erro de conexão com o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="w-[90vw] max-w-[400px] z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface-container-high rounded-2xl mx-auto mb-6 flex items-center justify-center apple-shadow border border-surface-variant/30">
            <span className="material-symbols-outlined text-primary text-3xl">playing_cards</span>
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">PokerAdmin</h1>
          <p className="text-secondary mt-2">Acesse sua conta para entrar na mesa</p>
        </div>

        <div className="bg-surface-container-lowest rounded-[32px] p-8 apple-shadow border border-surface-variant/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1 mb-2 block">
                Telefone Celular
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                required
                className="w-full bg-surface-container border border-surface-variant/50 rounded-2xl px-4 py-4 text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1 mb-2 block">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container border border-surface-variant/50 rounded-2xl px-4 py-4 text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/40"
              />
            </div>

            {error && (
              <p className="text-error text-sm text-center font-medium animate-in fade-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 mt-4"
            >
              {isLoading ? "Entrando..." : "Entrar na Conta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
