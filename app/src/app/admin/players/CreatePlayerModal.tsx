"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CreatePlayerModalProps {
  onPlayerCreated: (player: any) => void
}

export function CreatePlayerModal({ onPlayerCreated }: CreatePlayerModalProps) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    setShow(false)
    setName("")
    setPhone("")
  }

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onPlayerCreated(data.player)
        alert("Jogador adicionado com sucesso!\nA senha padrão para o primeiro acesso é: mudar123")
        handleClose()
      } else {
        alert(data.error || "Erro ao criar jogador")
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
        className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold active:scale-95 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">person_add</span>
        Adicionar Jogador
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[400px] max-h-[90vh] overflow-y-auto apple-shadow border border-surface-variant/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Novo Jogador</h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-5">
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  NOME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: João Silva"
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-label-caps text-secondary mb-2 block text-[11px] font-bold tracking-wider">
                  TELEFONE (DDD + NÚMERO)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Ex: 11999999999"
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              
              <div className="bg-surface-variant/30 p-4 rounded-xl border border-surface-variant/50">
                <p className="text-body-sm text-secondary flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">info</span>
                  <span>
                    O login será feito com este número. A senha inicial será <strong className="text-primary font-bold">mudar123</strong>, e o jogador deverá trocá-la no primeiro acesso.
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Salvando..." : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
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
