"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  initialPhone: string | null
  initialPixKey: string | null
  initialAvatar: string | null
  name: string
}

// Uma lista rápida de emojis divertidos para o perfil
const EMOJI_OPTIONS = ["😎", "🤠", "🤑", "🤡", "👽", "👻", "🦁", "🦈", "🎲", "🃏", "👑", "🚀"]

export function ProfileForm({ initialPhone, initialPixKey, initialAvatar, name }: ProfileFormProps) {
  const [phone, setPhone] = useState(initialPhone || "")
  const [pixKey, setPixKey] = useState(initialPixKey || "")
  const [avatar, setAvatar] = useState(initialAvatar || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pixKey, avatarUrl: avatar })
      })

      if (res.ok) {
        setIsEditing(false)
        router.refresh()
      } else {
        alert("Erro ao salvar perfil")
      }
    } catch (e) {
      console.error(e)
      alert("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  const userInitial = name.charAt(0).toUpperCase()

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 ios-shadow border border-surface-variant/20 mb-8">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-title-md text-primary font-bold">Dados Pessoais</h3>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          className="text-primary font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
        >
          {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Editar"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Emoji / Initial */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center text-4xl border-4 border-surface-container-lowest shadow-md">
            {avatar ? avatar : <span className="font-bold text-on-secondary-container">{userInitial}</span>}
          </div>
          {isEditing && (
            <div className="flex flex-wrap max-w-[200px] gap-2 justify-center mt-2">
              <button 
                onClick={() => setAvatar("")}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-xs font-bold"
              >
                {userInitial}
              </button>
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-surface-variant transition-colors ${avatar === emoji ? "bg-primary/20 border border-primary" : "bg-surface-container"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-label-caps text-secondary mb-1 block text-[11px]">NOME (Não editável)</label>
              <input 
                type="text" 
                value={name} 
                disabled 
                className="w-full bg-surface-variant/30 text-secondary border border-surface-variant/20 rounded-xl px-4 py-3"
              />
            </div>
            
            <div>
              <label className="text-label-caps text-secondary mb-1 block text-[11px]">TELEFONE PARA LOGIN</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                disabled={!isEditing} 
                placeholder="(11) 99999-9999"
                className={`w-full border rounded-xl px-4 py-3 text-primary transition-colors ${isEditing ? "bg-white border-outline-variant/40 focus:border-primary" : "bg-surface-variant/30 border-surface-variant/20 text-secondary"}`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-label-caps text-secondary mb-1 block text-[11px]">CHAVE PIX (Para receber transferências)</label>
              <input 
                type="text" 
                value={pixKey} 
                onChange={e => setPixKey(e.target.value)}
                disabled={!isEditing} 
                placeholder="Telefone, CPF, E-mail ou Aleatória"
                className={`w-full border rounded-xl px-4 py-3 text-primary transition-colors ${isEditing ? "bg-white border-outline-variant/40 focus:border-primary" : "bg-surface-variant/30 border-surface-variant/20 text-secondary"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
