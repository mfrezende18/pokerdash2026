import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const player = await prisma.user.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })
    }

    if (player.email) {
      return NextResponse.json(
        { error: "Jogador já possui conta vinculada" },
        { status: 400 }
      )
    }

    const token = uuidv4()
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.user.update({
      where: { id },
      data: {
        inviteToken: token,
        inviteTokenExpiry: expiry,
      },
    })

    return NextResponse.json({ token, expiry })
  } catch (error) {
    console.error("Erro ao gerar convite:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
