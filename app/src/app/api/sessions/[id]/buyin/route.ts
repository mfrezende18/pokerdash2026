import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { playerId, amount, type } = body

    if (!playerId || !amount || !type) {
      return NextResponse.json(
        { error: "playerId, amount e type são obrigatórios" },
        { status: 400 }
      )
    }

    // Check session exists and is active
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    if (session.status === "CLOSED") {
      return NextResponse.json(
        { error: "Sessão já fechada. Dados são imutáveis." },
        { status: 403 }
      )
    }

    const buyIn = await prisma.buyIn.create({
      data: {
        sessionId: id,
        playerId,
        amount: parseFloat(amount),
        type,
      },
    })

    return NextResponse.json(buyIn, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar buy-in:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
