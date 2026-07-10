
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefone e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Limpa a string do telefone (remove parênteses, traços, etc)
    const cleanPhone = phone.replace(/\D/g, "")

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciais inválidas ou usuário não possui senha cadastrada" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    const token = await signToken({ 
      id: user.id, 
      role: user.role,
      requirePasswordChange: user.requirePasswordChange 
    })

    const cookieStore = await cookies()
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    return NextResponse.json({ success: true, role: user.role })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
