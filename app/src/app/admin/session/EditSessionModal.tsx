"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type CashOutData = {
  playerId: string
  chipValue: number
  player: { name: string }
}

export function EditSessionModal({ session }: { session: { id: string, cashOuts: CashOutData[] } }) {
  const [show, setShow] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [newCashout, setNewCashout] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/sessions/edit-cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: selectedPlayer,
          newCashout: parseFloat(newCashout),
        }),
      })

      if (res.ok) {
        setShow(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao editar cashout")
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
        onClick={() => setShow(true)}
        className="text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded-lg flex items-center transition-colors"
        title="Editar Valores (Apenas Admin 1)"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[480px] apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-title-lg text-primary font-semibold">Editar Cashout</h3>
              <button
                onClick={() => setShow(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <div className="bg-error-container/30 border border-error/20 rounded-xl p-3 mb-6 flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-lg mt-0.5">warning</span>
              <p className="text-body-sm text-error font-medium">
                Apenas Admin 1 pode alterar dados de uma mesa finalizada.
              </p>
            </div>

            <form onSubmit={handleEdit} className="space-y-5">
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  JOGADOR
                </label>
                <select
                  required
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Selecione um jogador</option>
                  {session.cashOuts.map((c: CashOutData) => (
                    <option key={c.playerId} value={c.playerId}>
                      {c.player.name} (Cashout Original: R$ {c.chipValue})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlayer && (
                <div>
                  <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                    NOVO VALOR DE CASHOUT (R$)
                  </label>
                  <input
                    type="number"
                    value={newCashout}
                    onChange={(e) => setNewCashout(e.target.value)}
                    required
                    placeholder="0"
                    className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Salvando..." : "Salvar"}
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
