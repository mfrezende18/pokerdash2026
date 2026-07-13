import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { revalidateTag } from "next/cache"

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session || (session.role !== "ADMIN1" && session.role !== "ADMIN2")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { id, title, description, imageUrl, ctaUrl } = data

    if (id) {
      await prisma.event.update({
        where: { id },
        data: { title, description, imageUrl, ctaUrl }
      })
    } else {
      await prisma.event.create({
        data: {
          title,
          description,
          imageUrl,
          ctaUrl,
          createdById: session.id,
          eventDate: new Date() // Generic event date since we just use it as a banner
        }
      })
    }

    // @ts-expect-error
    revalidateTag("events")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session || (session.role !== "ADMIN1" && session.role !== "ADMIN2")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      await prisma.event.delete({ where: { id } })
      // @ts-expect-error
    revalidateTag("events")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
