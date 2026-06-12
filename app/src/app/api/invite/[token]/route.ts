import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { inviteToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token de convite inválido" },
        { status: 404 }
      )
    }

    if (user.email) {
      return NextResponse.json(
        { error: "Este convite já foi utilizado" },
        { status: 400 }
      )
    }

    if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token de convite expirado" },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 400 }
      )
    }

    // Hash password and update user
    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        passwordHash,
        inviteToken: null,
        inviteTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar convite:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
