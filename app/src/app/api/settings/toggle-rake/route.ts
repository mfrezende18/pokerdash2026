import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    // Apenas ADMIN1 e ADMIN2 podem alterar essa configuração
    if (sessionUser?.role !== "ADMIN1" && sessionUser?.role !== "ADMIN2") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    const { currentValue } = body

    const settings = await prisma.systemSettings.findFirst()

    if (settings) {
      await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { showRakeToUsers: !currentValue },
      })
    } else {
      await prisma.systemSettings.create({
        data: { showRakeToUsers: !currentValue },
      })
    }

    return NextResponse.json({ success: true, showRakeToUsers: !currentValue })
  } catch (error) {
    console.error("Toggle rake error:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
