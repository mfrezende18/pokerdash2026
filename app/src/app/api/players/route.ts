import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const players = await prisma.user.findMany({
      where: {
        role: { not: "DELETED" },
        OR: [
          { phone: { not: "11999999999" } },
          { phone: null }
        ]
      },
      orderBy: { name: "asc" },
      include: {
        buyIns: true,
        cashOuts: true,
      },
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error("Erro ao listar jogadores:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const player = await prisma.user.create({
      data: {
        name: name.trim(),
        role: "USER",
      },
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar jogador:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
