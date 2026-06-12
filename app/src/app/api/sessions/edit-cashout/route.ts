import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    if (sessionUser?.role !== "ADMIN1") {
      return NextResponse.json({ error: "Apenas Admin 1 pode editar sessões fechadas" }, { status: 403 })
    }

    const body = await request.json()
    const { sessionId, playerId, newCashout } = body

    if (!sessionId || !playerId || newCashout === undefined) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Calcular o buy-in total do jogador na sessão para recalcular o netResult
    const buyIns = await prisma.buyIn.findMany({
      where: { sessionId, playerId },
    })

    const totalBuyInAmount = buyIns.reduce((sum, b) => sum + b.amount, 0)
    const newNetResult = newCashout - totalBuyInAmount

    // Atualizar o Cashout do jogador
    const existingCashout = await prisma.cashOut.findFirst({
      where: { sessionId, playerId },
    })

    if (!existingCashout) {
      return NextResponse.json({ error: "Jogador não possui cashout nesta sessão" }, { status: 404 })
    }

    await prisma.cashOut.update({
      where: { id: existingCashout.id },
      data: {
        chipValue: newCashout,
        netResult: newNetResult,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Edit cashout error:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
