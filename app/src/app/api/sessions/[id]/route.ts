import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (action === "close") {
      const session = await prisma.session.findUnique({
        where: { id },
        include: { buyIns: true, cashOuts: true },
      })

      if (!session) {
        return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
      }

      if (session.status === "CLOSED") {
        return NextResponse.json({ error: "Sessão já está fechada" }, { status: 400 })
      }

      // Auto-cashout 0 chips for anyone who hasn't cashed out (busted players)
      const playerIdsWithBuyIn = [...new Set(session.buyIns.map((b) => b.playerId))]
      const playerIdsWithCashOut = new Set(session.cashOuts.map((c) => c.playerId))
      const bustedPlayers = playerIdsWithBuyIn.filter(pid => !playerIdsWithCashOut.has(pid))

      for (const playerId of bustedPlayers) {
        const playerBuyIns = session.buyIns.filter((b) => b.playerId === playerId)
        const totalBuyIn = playerBuyIns.reduce((sum, b) => sum + b.amount, 0)
        
        await prisma.cashOut.create({
          data: {
            sessionId: id,
            playerId,
            chipValue: 0,
            netResult: -totalBuyIn, // loss is equal to total buy-ins
          }
        })
      }

      const updated = await prisma.session.update({
        where: { id },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
        },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { getAuthSession } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getAuthSession()
    if (!sessionUser || sessionUser.role !== "ADMIN1") {
      return NextResponse.json({ error: "Apenas Admin 1 pode apagar mesas" }, { status: 403 })
    }

    const { id } = await params
    
    // We rely on onDelete: Cascade to remove buy-ins and cash-outs.
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar sessão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
