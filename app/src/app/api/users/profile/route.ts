import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    if (!sessionUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { pixKey, phone, avatarUrl } = body

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(pixKey !== undefined && { pixKey }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Erro interno ao atualizar perfil" }, { status: 500 })
  }
}
