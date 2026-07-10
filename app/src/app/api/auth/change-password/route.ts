import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getAuthSession, signToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session || !session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Hash nova senha
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Atualiza usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        passwordHash,
        requirePasswordChange: false
      }
    })

    // Gera um novo token sem a flag de requirePasswordChange
    const token = await signToken({ 
      id: updatedUser.id, 
      role: updatedUser.role,
      requirePasswordChange: false 
    })

    const cookieStore = await cookies()
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
