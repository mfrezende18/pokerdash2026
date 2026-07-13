"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export function EventForm({ existingEvent, userId }: { existingEvent: any, userId: string }) {
  const [title, setTitle] = useState(existingEvent?.title || "")
  const [description, setDescription] = useState(existingEvent?.description || "")
  const [imageUrl, setImageUrl] = useState(existingEvent?.imageUrl || "")
  const [ctaUrl, setCtaUrl] = useState(existingEvent?.ctaUrl || "")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingEvent?.id,
          title,
          description,
          imageUrl,
          ctaUrl,
        })
      })

      if (res.ok) {
        alert("Banner atualizado com sucesso!")
        router.refresh()
      } else {
        alert("Erro ao salvar o banner.")
      }
    } catch (error) {
      console.error(error)
      alert("Erro de rede.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingEvent?.id) return
    if (!confirm("Tem certeza que deseja apagar o banner atual?")) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/events?id=${existingEvent.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        alert("Banner removido!")
        setTitle("")
        setDescription("")
        setImageUrl("")
        setCtaUrl("")
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 apple-shadow border border-surface-variant/20">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-label-md text-on-surface mb-2 font-bold">Título do Evento</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-variant/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface"
            placeholder="Ex: Torneio de Inverno"
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2 font-bold">Descrição</label>
          <input
            required
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-variant/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface"
            placeholder="Ex: 50K Garantidos neste fim de semana"
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2 font-bold">Link de Destino (Opcional)</label>
          <input
            type="url"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            className="w-full bg-surface-variant/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface"
            placeholder="Ex: https://wa.me/5511999999999"
          />
        </div>

        <div>
          <label className="block text-label-md text-on-surface mb-2 font-bold">Banner (Imagem 1080x1350)</label>
          {imageUrl && (
            <div className="mb-4 max-w-[200px] rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 aspect-[4/5] relative">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-secondary-container/80 transition-colors"
          >
            <span className="material-symbols-outlined">upload</span>
            {imageUrl ? "Trocar Imagem" : "Escolher Imagem"}
          </button>
        </div>

        <div className="pt-6 flex flex-col md:flex-row gap-4 border-t border-surface-variant/20">
          <button
            type="submit"
            disabled={isLoading || !title || !description}
            className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar e Ativar Evento"}
          </button>

          {existingEvent && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-none bg-error/10 text-error font-bold py-4 px-8 rounded-xl hover:bg-error/20 transition-colors disabled:opacity-50"
            >
              Apagar Banner
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
