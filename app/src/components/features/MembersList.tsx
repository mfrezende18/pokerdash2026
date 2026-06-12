"use client"

import { useState } from "react"
import Image from "next/image"
import { cn, formatCurrency, getInitials } from "@/lib/utils"

interface Member {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  totalSessions: number
  totalProfit: number
  hasAccount: boolean
  inviteToken: string | null
}

interface MembersListProps {
  members: Member[]
}

export function MembersList({ members }: MembersListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setIsAdding(true)

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })

      if (res.ok) {
        setNewName("")
        setShowAddForm(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleGenerateInvite = async (playerId: string) => {
    try {
      const res = await fetch(`/api/players/${playerId}/invite`, {
        method: "POST",
      })

      if (res.ok) {
        const data = await res.json()
        const url = `${window.location.origin}/invite/${data.token}`
        await navigator.clipboard.writeText(url)
        setCopiedId(playerId)
        setTimeout(() => setCopiedId(null), 3000)
      }
    } catch (error) {
      console.error("Erro ao gerar convite:", error)
    }
  }

  return (
    <>
      {/* Add Player Button */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Adicionar Jogador
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddPlayer}
          className="bg-surface-container-low rounded-xl p-6 mb-6 animate-slide-up border border-surface-variant/30 flex gap-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do jogador"
            required
            className="flex-1 border border-outline-variant/40 rounded-xl px-4 py-3 bg-white text-primary focus:border-primary focus:ring-0 transition-colors"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {isAdding ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      )}

      {/* Members List */}
      <div className="bg-surface-container-lowest rounded-2xl ios-shadow border border-surface-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-label-caps text-secondary border-b border-surface-variant/20">
                <th className="px-6 py-4 font-bold text-[11px]">JOGADOR</th>
                <th className="px-6 py-4 font-bold text-[11px]">STATUS</th>
                <th className="px-6 py-4 font-bold text-[11px]">SESSÕES</th>
                <th className="px-6 py-4 font-bold text-right text-[11px]">P/L</th>
                <th className="px-6 py-4 font-bold text-right text-[11px]">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/10">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        member.avatarUrl.startsWith("http") || member.avatarUrl.startsWith("/") ? (
                          <Image src={member.avatarUrl} alt={member.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-sm">
                            {member.avatarUrl}
                          </div>
                        )
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">
                          {getInitials(member.name)}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-primary text-sm block">
                          {member.name}
                        </span>
                        {member.email && (
                          <span className="text-body-sm text-secondary text-xs">
                            {member.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-xs px-3 py-1 rounded-full font-bold",
                        member.hasAccount
                          ? "text-on-tertiary-container bg-tertiary-fixed/20"
                          : "text-secondary bg-surface-container"
                      )}
                    >
                      {member.hasAccount ? "Verificado" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-mono-data text-secondary">
                    {member.totalSessions}
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-mono-data text-right font-bold",
                      member.totalProfit > 0
                        ? "text-on-tertiary-container"
                        : member.totalProfit < 0
                        ? "text-error"
                        : "text-primary"
                    )}
                  >
                    {member.totalProfit > 0 ? "+" : ""}
                    {formatCurrency(member.totalProfit)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!member.hasAccount && (
                      <button
                        onClick={() => handleGenerateInvite(member.id)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95",
                          copiedId === member.id
                            ? "bg-tertiary-fixed/20 text-on-tertiary-container"
                            : "bg-primary text-on-primary"
                        )}
                      >
                        {copiedId === member.id ? "✓ Copiado!" : "Gerar Convite"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
