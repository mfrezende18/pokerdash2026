"use client"

import { useEffect, useState } from "react"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"

interface Player {
  id: string
  name: string
  phone: string | null
  pixKey: string | null
  role: string
  inviteToken: string | null
  status: "REGISTRADO" | "PENDENTE"
}

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  async function fetchPlayers() {
    try {
      const res = await fetch("/api/admin/players")
      const data = await res.json()
      setPlayers(data.players)
      setCurrentUserRole(data.currentUserRole)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlayers()
  }, [])

  const handleCopyLink = (token: string | null) => {
    if (!token) return
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 3000)
  }

  const handleRoleChange = async (playerId: string, newRole: string) => {
    if (!confirm(`Tem certeza que deseja alterar a permissão deste jogador para ${newRole}?`)) {
      return
    }

    setIsUpdating(playerId)
    try {
      const res = await fetch("/api/admin/players", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, newRole })
      })
      const data = await res.json()

      if (res.ok) {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, role: newRole } : p))
        alert("Permissão atualizada com sucesso.")
      } else {
        alert(data.error || "Erro ao atualizar permissão")
      }
    } catch (e) {
      console.error(e)
      alert("Erro de conexão")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR o jogador ${playerName}? Isso ocultará o jogador do sistema, mas manterá o pot total de sessões antigas.`)) {
      return
    }

    setIsUpdating(playerId)
    try {
      const res = await fetch("/api/admin/players", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action: "delete" })
      })
      const data = await res.json()

      if (res.ok) {
        setPlayers(prev => prev.filter(p => p.id !== playerId))
        alert("Jogador excluído com sucesso.")
      } else {
        alert(data.error || "Erro ao excluir jogador")
      }
    } catch (e) {
      console.error(e)
      alert("Erro de conexão")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleUpdatePhone = async (playerId: string, currentPhone: string | null) => {
    const newPhone = prompt("Digite o novo número de celular com DDD (apenas números ou no formato (XX) XXXXX-XXXX):", currentPhone || "")
    if (newPhone === null) return // Cancelado
    
    setIsUpdating(playerId)
    try {
      const res = await fetch("/api/admin/players", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action: "updatePhone", phone: newPhone })
      })
      const data = await res.json()

      if (res.ok) {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, phone: data.player.phone } : p))
        alert("Telefone atualizado com sucesso!")
      } else {
        alert(data.error || "Erro ao atualizar telefone")
      }
    } catch (e) {
      console.error(e)
      alert("Erro de conexão")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 mb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-headline-lg text-primary">Jogadores</h1>
            <p className="text-body-lg text-secondary mt-1">
              Gestão de dados e permissões
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 apple-shadow border border-surface-variant/20">
          {isLoading ? (
            <div className="text-center py-10 text-secondary">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-variant/30">
                    <th className="pb-3 font-bold text-secondary text-sm">NOME</th>
                    <th className="pb-3 font-bold text-secondary text-sm">STATUS</th>
                    <th className="pb-3 font-bold text-secondary text-sm">TELEFONE</th>
                    <th className="pb-3 font-bold text-secondary text-sm">CHAVE PIX</th>
                    <th className="pb-3 font-bold text-secondary text-sm">PERMISSÃO</th>
                    <th className="pb-3 font-bold text-secondary text-sm text-right">CONVITE</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-surface-variant/10 last:border-0 hover:bg-surface-container/30 transition-colors">
                      <td className="py-4 font-bold text-primary">{player.name}</td>
                      <td className="py-4">
                        {player.status === "REGISTRADO" ? (
                          <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md text-xs font-bold tracking-wider">
                            ATIVO
                          </span>
                        ) : (
                          <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md text-xs font-bold tracking-wider">
                            MIGRAÇÃO
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-secondary text-sm">
                        <div className="flex items-center gap-1">
                          {player.phone ? (
                            <span>{player.phone}</span>
                          ) : (
                            <span className="italic opacity-50">Não definido</span>
                          )}
                          {currentUserRole === "ADMIN1" && (
                            <button
                              onClick={() => handleUpdatePhone(player.id, player.phone)}
                              disabled={isUpdating === player.id}
                              className="text-primary hover:text-primary/70 transition-colors p-1.5 rounded-md hover:bg-primary/10 disabled:opacity-50 ml-1"
                              title="Editar Telefone"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-secondary text-sm">
                        {player.pixKey || "Não definido"}
                      </td>
                      <td className="py-4">
                        {(currentUserRole === "ADMIN1" || currentUserRole === "ADMIN2") ? (
                          <select
                            value={player.role}
                            onChange={(e) => handleRoleChange(player.id, e.target.value)}
                            disabled={isUpdating === player.id}
                            className="bg-surface-container border border-surface-variant/40 rounded-lg px-2 py-1 text-sm text-primary focus:outline-none focus:border-primary disabled:opacity-50"
                          >
                            <option value="USER">Jogador</option>
                            <option value="ADMIN3">Operador (Admin 3)</option>
                            <option value="ADMIN2">Gerente (Admin 2)</option>
                            {currentUserRole === "ADMIN1" && (
                              <option value="ADMIN1">Supremo (Admin 1)</option>
                            )}
                          </select>
                        ) : (
                          <span className="text-secondary text-sm font-medium">
                            {player.role === "ADMIN1" ? "Supremo" : player.role === "ADMIN2" ? "Gerente" : player.role === "ADMIN3" ? "Operador" : "Jogador"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right flex items-center justify-end gap-3">
                        {player.status === "PENDENTE" && player.inviteToken ? (
                          <button
                            onClick={() => handleCopyLink(player.inviteToken)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {copiedToken === player.inviteToken ? "check" : "content_copy"}
                            </span>
                            {copiedToken === player.inviteToken ? "Copiado!" : "Copiar"}
                          </button>
                        ) : (
                          <span className="text-secondary/50 text-sm italic mr-2">Registrado</span>
                        )}
                        {currentUserRole === "ADMIN1" && (
                          <button
                            onClick={() => handleDeletePlayer(player.id, player.name)}
                            disabled={isUpdating === player.id}
                            className="text-error hover:text-error/70 transition-colors p-2 rounded-lg hover:bg-error-container/20 disabled:opacity-50"
                            title="Excluir Jogador"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar role={currentUserRole || "USER"} />
    </>
  )
}
