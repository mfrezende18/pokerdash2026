import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"

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

      // Save pending cashouts sent by frontend
      const pendingCashOuts = body.pendingCashOuts || {}
      
      for (const [playerId, chipValue] of Object.entries(pendingCashOuts)) {
        const playerBuyIns = session.buyIns.filter((b) => b.playerId === playerId)
        const totalBuyIn = playerBuyIns.reduce((sum, b) => sum + b.amount, 0)
        
        await prisma.cashOut.create({
          data: {
            sessionId: id,
            playerId,
            chipValue: Number(chipValue),
            netResult: Number(chipValue) - totalBuyIn,
          }
        })
      }

      const updated = await prisma.session.update({
        where: { id },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          rakeCollected: body.rakeCollected ? parseFloat(body.rakeCollected) : 0,
        },
      })

      // @ts-expect-error
      revalidateTag("sessions")
      revalidatePath("/")

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

    // @ts-expect-error
    revalidateTag("sessions")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar sessão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
