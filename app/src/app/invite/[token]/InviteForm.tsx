"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function InviteForm({ token }: { token: string }) {
  const [phone, setPhone] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (val.length > 11) val = val.slice(0, 11)
    
    let formatted = val
    if (val.length > 2) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`
    }
    if (val.length > 7) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    }
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phone, pixKey, password }),
      })

      if (res.ok) {
        // Sucesso -> Redireciona para home (já logado)
        router.push("/")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao concluir cadastro")
      }
    } catch {
      setError("Erro de conexão com o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-[32px] p-8 apple-shadow border border-surface-variant/20">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1 mb-2 block">
            Telefone Celular (Login)
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
            Chave PIX (Para receber Cashouts)
          </label>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, E-mail ou Celular"
            className="w-full bg-surface-container border border-surface-variant/50 rounded-2xl px-4 py-4 text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/40"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1 mb-2 block">
            Criar Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
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
          {isLoading ? "Salvando..." : "Concluir Cadastro"}
        </button>
      </form>
    </div>
  )
}
