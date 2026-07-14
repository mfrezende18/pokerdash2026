import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getAuthSession } from "@/lib/auth"
import { revalidateTag } from "next/cache"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getAuthSession()
    if (!sessionUser || (sessionUser.role !== "ADMIN1" && sessionUser.role !== "ADMIN3")) {
      return errorResponse("Não autorizado", 401)
    }

    const { id } = await params
    const body = await request.json()
    const { buyInId, action } = body // action: "APPROVE" | "REJECT"

    if (!buyInId || (action !== "APPROVE" && action !== "REJECT")) {
      return errorResponse("Dados inválidos", 400)
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

    const buyIn = await prisma.buyIn.findUnique({
      where: { id: buyInId }
    })

    if (!buyIn || buyIn.sessionId !== id || buyIn.status !== "PENDING") {
      return errorResponse("Solicitação inválida ou já processada.", 400)
    }

    if (action === "APPROVE") {
      const updated = await prisma.buyIn.update({
        where: { id: buyInId },
        data: { status: "APPROVED" }
      })
      
      return successResponse(updated, 200)
    } else {
      // Reject
      const deleted = await prisma.buyIn.delete({
        where: { id: buyInId }
      })
      
      return successResponse({ deleted: true }, 200)
    }

  } catch (error) {
    console.error("Erro ao aprovar/recusar re-buy:", error)
    return errorResponse("Erro interno", 500)
  }
}
