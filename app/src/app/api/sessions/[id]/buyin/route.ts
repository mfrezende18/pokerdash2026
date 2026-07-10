import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { buyInSchema } from "@/lib/validations"
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
      parsedBody = buyInSchema.parse({
        ...body,
        amount: parseFloat(body.amount)
      })
    } catch (e) {
      if (e instanceof z.ZodError) {
        return zodErrorResponse(e)
      }
      return errorResponse("Dados inválidos", 400)
    }

    const { playerId, amount, type } = parsedBody

    // Check session exists and is active
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      return errorResponse("Sessão não encontrada", 404)
    }

    if (session.status === "CLOSED") {
      return errorResponse("Sessão já fechada. Dados são imutáveis.", 403)
    }

    const buyIn = await prisma.buyIn.create({
      data: {
        sessionId: id,
        playerId,
        amount,
        type,
      },
    })

    return successResponse(buyIn, 201)
  } catch (error) {
    console.error("Erro ao registrar buy-in:", error)
    return errorResponse("Erro interno", 500)
  }
}

