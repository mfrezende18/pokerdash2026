import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { profileSchema } from "@/lib/validations"
import { successResponse, errorResponse, zodErrorResponse } from "@/lib/api-response"
import { z } from "zod"

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    if (!sessionUser) {
      return errorResponse("Não autenticado", 401)
    }

    const body = await request.json()
    
    let parsedBody
    try {
      parsedBody = profileSchema.parse(body)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return zodErrorResponse(e)
      }
      return errorResponse("Dados inválidos", 400)
    }

    const { pixKey, phone, avatarUrl } = parsedBody

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(pixKey !== undefined && { pixKey }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      }
    })

    return successResponse({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return errorResponse("Erro interno ao atualizar perfil", 500)
  }
}

