import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { playerSchema } from "@/lib/validations"
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response"
import { z } from "zod"

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

    return successResponse(players)
  } catch (error) {
    console.error("Erro ao listar jogadores:", error)
    return errorResponse("Erro interno", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let parsedBody
    try {
      parsedBody = playerSchema.parse(body)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return zodErrorResponse(e)
      }
      return errorResponse("Dados inválidos", 400)
    }

    const { name } = parsedBody

    const player = await prisma.user.create({
      data: {
        name,
        role: "USER",
      },
    })

    return successResponse(player, 201)
  } catch (error) {
    console.error("Erro ao criar jogador:", error)
    return errorResponse("Erro interno", 500)
  }
}

