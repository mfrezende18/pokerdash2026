"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function NewSessionForm() {
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [blinds, setBlinds] = useState("5/10")
  const [rakeType] = useState<"FIXED" | "PERCENT">("PERCENT")
  const [rakePercent] = useState(5)
  const [rakeFixed] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          blinds,
          rakeType,
          rakePercent: rakeType === "PERCENT" ? rakePercent : "0",
          rakeFixed: rakeType === "FIXED" ? rakeFixed : "0",
          createdById: "admin",
        }),
      })

      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao criar sessão")
      }
    } catch {
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold active:scale-95 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Nova Mesa
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[500px] apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Abrir Nova Mesa</h3>
              <button
                onClick={() => setShow(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-5">
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  NOME DA MESA
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Sessão Oficial 12/06/2026"
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  BLINDS
                </label>
                <input
                  type="text"
                  value={blinds}
                  onChange={(e) => setBlinds(e.target.value)}
                  placeholder="Ex: 5/10"
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Criando..." : "Criar Mesa"}
                </button>
                <button
                  type="button"
                  onClick={() => setShow(false)}
                  className="flex-1 bg-surface-container text-primary py-3.5 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
