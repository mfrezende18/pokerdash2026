"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface EmptyTableStateProps {
  isAdmin: boolean
}

export function EmptyTableState({ isAdmin }: EmptyTableStateProps) {
  const [showModal, setShowModal] = useState(false)
  const [location, setLocation] = useState("Nova Odessa FE")
  const [customLocation, setCustomLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Generate current date and time
  const now = new Date()
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const handleCreate = async () => {
    setIsSubmitting(true)
    const finalLocation = location === "Outro" ? customLocation : location
    const sessionName = `Sessão Oficial - ${finalLocation} - ${formattedDate} ${formattedTime}`

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          blinds: "1/2",
          rakeType: "NONE",
        }),
      })

      if (response.ok) {
        setShowModal(false)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.message || "Erro ao criar mesa")
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      alert("Erro de conexão")
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl apple-shadow min-h-[300px] flex flex-col items-center justify-center p-10 border border-surface-variant/20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-[url('/flyer-resenha.jpg')] bg-cover bg-center opacity-30 z-0"
          style={{ filter: 'grayscale(0.5)' }}
        />
        
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-surface-container-lowest/50 z-0" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-primary/70 mb-4 drop-shadow-md">
            table_restaurant
          </span>
          <h2 className="text-headline-md text-primary font-bold drop-shadow-sm">
            Nenhuma mesa aberta
          </h2>
          <p className="text-secondary/90 font-medium mt-2 max-w-sm">
            No momento não há jogos rolando. Fique atento às nossas notificações!
          </p>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center apple-shadow hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-3xl">add</span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-3xl p-8 w-[90vw] max-w-[400px] apple-shadow border border-surface-variant/20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-lg text-primary font-semibold">Abrir Nova Mesa</h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-secondary text-sm">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <span className="text-label-caps text-secondary block mb-1">Data e Hora (Automático)</span>
                <span className="text-title-md font-bold text-primary">{formattedDate} às {formattedTime}</span>
              </div>

              <div>
                <label className="text-label-caps text-secondary mb-2 block font-bold tracking-wider">
                  LOCAL DA SESSÃO
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="Nova Odessa FE">Nova Odessa FE</option>
                  <option value="Americana GU">Americana GU</option>
                  <option value="Sumaré JOHN">Sumaré JOHN</option>
                  <option value="Outro">Outro...</option>
                </select>
              </div>

              {location === "Outro" && (
                <div>
                  <label className="text-label-caps text-secondary mb-2 block font-bold tracking-wider">
                    DIGITE O LOCAL
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Campinas..."
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={isSubmitting || (location === "Outro" && customLocation.trim() === "")}
                className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">play_arrow</span>
                    Iniciar Sessão
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
