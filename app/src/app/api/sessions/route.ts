import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        buyIns: { include: { player: true } },
        cashOuts: { include: { player: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { startedAt: "desc" },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Erro ao listar sessões:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { newSessionSchema } from "@/lib/validations"
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getAuthSession()

    if (!sessionUser || (sessionUser.role !== "ADMIN1" && sessionUser.role !== "ADMIN2")) {
      return errorResponse("Sem permissão", 403)
    }

    const body = await request.json()
    
    let parsedBody
    try {
      parsedBody = newSessionSchema.parse({
        ...body,
        rakePercent: body.rakePercent ? parseFloat(body.rakePercent) : undefined,
        rakeFixed: body.rakeFixed ? parseFloat(body.rakeFixed) : undefined,
        createdById: sessionUser.id
      })
    } catch (e) {
      if (e instanceof z.ZodError) {
        return zodErrorResponse(e)
      }
      return errorResponse("Dados inválidos", 400)
    }

    const { name, blinds, rakeType, rakePercent, rakeFixed, createdById } = parsedBody

    // Check for existing active session
    const existingActive = await prisma.session.findFirst({
      where: { status: "ACTIVE" },
    })

    if (existingActive) {
      return errorResponse("Já existe uma sessão ativa. Feche-a primeiro.", 400)
    }

    const session = await prisma.session.create({
      data: {
        name,
        blinds: blinds || "1/2",
        rakeType: rakeType || "NONE",
        rakePercent,
        rakeFixed,
        createdById,
      },
    })

    return successResponse(session, 201)
  } catch (error) {
    console.error("Erro ao criar sessão:", error)
    return errorResponse("Erro interno", 500)
  }
}
