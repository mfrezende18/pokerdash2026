import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { playerId, chipValue } = body

    if (!playerId || chipValue === undefined) {
      return NextResponse.json(
        { error: "playerId e chipValue são obrigatórios" },
        { status: 400 }
      )
    }

    // Check session
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

    // Calculate total buy-ins for player
    const playerBuyIns = await prisma.buyIn.findMany({
      where: { sessionId: id, playerId },
    })
    const totalBuyIn = playerBuyIns.reduce((sum, b) => sum + b.amount, 0)

    // Calculate net result
    const netResult = parseFloat(chipValue) - totalBuyIn

    // Check if already cashed out
    const existingCashOut = await prisma.cashOut.findFirst({
      where: { sessionId: id, playerId },
    })

    if (existingCashOut) {
      return NextResponse.json(
        { error: "Jogador já fez cash-out nesta sessão" },
        { status: 400 }
      )
    }

    const cashOut = await prisma.cashOut.create({
      data: {
        sessionId: id,
        playerId,
        chipValue: parseFloat(chipValue),
        netResult,
      },
    })

    return NextResponse.json(cashOut, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar cash-out:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
