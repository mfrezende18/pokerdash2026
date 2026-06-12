import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, phone, pixKey, password } = body

    if (!token || !phone || !password) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, "")

    // Find user with valid token
    const user = await prisma.user.findUnique({
      where: { inviteToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Convite inválido ou não encontrado" }, { status: 404 })
    }

    if (user.inviteTokenExpiry && new Date() > user.inviteTokenExpiry) {
      return NextResponse.json({ error: "Este convite expirou" }, { status: 400 })
    }

    // Check if phone is already used by someone else
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    })
    
    if (existingPhone && existingPhone.id !== user.id) {
      return NextResponse.json({ error: "Este telefone já está em uso" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: cleanPhone,
        pixKey,
        passwordHash,
        inviteToken: null, // Clear token after use
        inviteTokenExpiry: null,
      },
    })

    // Auto login
    const sessionToken = await signToken({ id: updatedUser.id, role: updatedUser.role })

    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
