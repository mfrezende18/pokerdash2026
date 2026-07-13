import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getAuthSession } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getAuthSession()
    if (!sessionUser) {
      return errorResponse("Não autenticado", 401)
    }

    const { id } = await params
    const body = await request.json()
    
    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return errorResponse("Valor inválido", 400)
    }

    // Check session exists and is active
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      return errorResponse("Sessão não encontrada", 404)
    }

    if (session.status === "CLOSED") {
      return errorResponse("Sessão já fechada.", 403)
    }

    // Check if player has any pending rebuy already
    const existingPending = await prisma.buyIn.findFirst({
      where: {
        sessionId: id,
        playerId: sessionUser.id,
        status: "PENDING"
      }
    })

    if (existingPending) {
      return errorResponse("Você já tem uma solicitação em andamento.", 400)
    }

    const buyIn = await prisma.buyIn.create({
      data: {
        sessionId: id,
        playerId: sessionUser.id,
        amount,
        type: "REBUY",
        status: "PENDING"
      },
    })

    return successResponse(buyIn, 201)
  } catch (error) {
    console.error("Erro ao solicitar re-buy:", error)
    return errorResponse("Erro interno", 500)
  }
}
