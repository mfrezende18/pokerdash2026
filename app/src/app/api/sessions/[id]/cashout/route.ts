import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { cashOutSchema } from "@/lib/validations"
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    let parsedBody
    try {
      parsedBody = cashOutSchema.parse({
        ...body,
        chipValue: parseFloat(body.chipValue)
      })
    } catch (e) {
      if (e instanceof z.ZodError) {
        return zodErrorResponse(e)
      }
      return errorResponse("Dados inválidos", 400)
    }

    const { playerId, chipValue } = parsedBody

    // Check session
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      return errorResponse("Sessão não encontrada", 404)
    }

    if (session.status === "CLOSED") {
      return errorResponse("Sessão já fechada. Dados são imutáveis.", 403)
    }

    // Check if already cashed out to avoid duplicate cashouts
    const existingCashOut = await prisma.cashOut.findFirst({
      where: { sessionId: id, playerId },
    })

    if (existingCashOut) {
      return errorResponse("Jogador já fez cash-out nesta sessão", 400)
    }

    // Calculate total buy-ins for player
    const playerBuyIns = await prisma.buyIn.findMany({
      where: { sessionId: id, playerId },
    })
    const totalBuyIn = playerBuyIns.reduce((sum, b) => sum + b.amount, 0)

    // Calculate net result
    const netResult = chipValue - totalBuyIn

    const cashOut = await prisma.cashOut.create({
      data: {
        sessionId: id,
        playerId,
        chipValue,
        netResult,
      },
    })

    return successResponse(cashOut, 201)
  } catch (error) {
    console.error("Erro ao processar cash-out:", error)
    return errorResponse("Erro interno", 500)
  }
}

