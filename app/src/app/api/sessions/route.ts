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

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getAuthSession()

    if (!sessionUser || (sessionUser.role !== "ADMIN1" && sessionUser.role !== "ADMIN2")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { name, blinds, rakeType, rakePercent, rakeFixed } = body

    if (!name) {
      return NextResponse.json(
        { error: "name é obrigatório" },
        { status: 400 }
      )
    }

    const createdById = sessionUser.id

    // Check for existing active session
    const existingActive = await prisma.session.findFirst({
      where: { status: "ACTIVE" },
    })

    if (existingActive) {
      return NextResponse.json(
        { error: "Já existe uma sessão ativa. Feche-a primeiro." },
        { status: 400 }
      )
    }

    const session = await prisma.session.create({
      data: {
        name,
        blinds: blinds || "1/2",
        rakeType: rakeType || "NONE",
        rakePercent: rakePercent ? parseFloat(rakePercent) : 0,
        rakeFixed: rakeFixed ? parseFloat(rakeFixed) : 0,
        createdById,
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar sessão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
