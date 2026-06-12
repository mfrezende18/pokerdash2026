import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const sessionUser = await getAuthSession()
    
    // Apenas ADMIN1 e ADMIN2 podem alterar essa configuração
    if (sessionUser?.role !== "ADMIN1" && sessionUser?.role !== "ADMIN2") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const formData = await request.formData()
    const currentValue = formData.get("currentValue") === "true"

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

    // Redireciona de volta para o painel admin
    return NextResponse.redirect(new URL("/admin", request.url), 303)
  } catch (error) {
    console.error("Toggle rake error:", error)
    return NextResponse.redirect(new URL("/admin", request.url), 303)
  }
}
