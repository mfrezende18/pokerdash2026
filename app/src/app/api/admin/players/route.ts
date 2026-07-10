import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    if (sessionUser?.role !== "ADMIN1" && sessionUser?.role !== "ADMIN2") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { 
        role: { not: "DELETED" },
        phone: { not: "11999999999" } 
      },
      orderBy: { name: "asc" }
    })

    const players = users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      pixKey: u.pixKey,
      role: u.role,
      inviteToken: u.inviteToken,
      status: u.passwordHash && u.phone ? "REGISTRADO" : "PENDENTE"
    }))

    return NextResponse.json({ 
      players,
      currentUserRole: sessionUser?.role 
    })
  } catch (error) {
    console.error("Fetch players error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    if (sessionUser?.role !== "ADMIN1" && sessionUser?.role !== "ADMIN2") {
      return NextResponse.json({ error: "Sem permissão para alterar jogadores" }, { status: 403 })
    }

    const body = await request.json()
    const { playerId, newRole, action } = body

    if (!playerId) {
      return NextResponse.json({ error: "playerId é obrigatório" }, { status: 400 })
    }

    // Soft Delete (Ocultar jogador)
    if (action === "delete") {
      if (sessionUser.role !== "ADMIN1") {
        return NextResponse.json({ error: "Apenas o Admin 1 pode excluir jogadores" }, { status: 403 })
      }
      
      if (playerId === sessionUser.id) {
        return NextResponse.json({ error: "Você não pode excluir a si mesmo" }, { status: 400 })
      }
      
      const userToHide = await prisma.user.findUnique({ where: { id: playerId }})
      if (!userToHide) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })

      const updated = await prisma.user.update({
        where: { id: playerId },
        data: { 
          role: "DELETED",
          name: `${userToHide.name} (Excluído)`,
          phone: null,
          email: null,
          inviteToken: null,
          passwordHash: null
        }
      })
      return NextResponse.json({ success: true, player: updated })
    }

    // Update Role
    if (newRole) {
      const validRoles = ["ADMIN1", "ADMIN2", "ADMIN3", "USER"]
      if (!validRoles.includes(newRole)) {
        return NextResponse.json({ error: "Role inválida" }, { status: 400 })
      }

      if (sessionUser.role === "ADMIN2" && newRole === "ADMIN1") {
        return NextResponse.json({ error: "Admin 2 não pode promover para Admin 1" }, { status: 403 })
      }

      if (playerId === sessionUser.id && newRole !== sessionUser.role) {
        return NextResponse.json({ error: "Você não pode rebaixar a si mesmo" }, { status: 400 })
      }

      const updated = await prisma.user.update({
        where: { id: playerId },
        data: { role: newRole }
      })

      return NextResponse.json({ success: true, player: { id: updated.id, role: updated.role } })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
