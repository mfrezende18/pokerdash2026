import { prisma } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { redirect } from "next/navigation"
import { EventForm } from "./EventForm"

export const dynamic = "force-dynamic"

export default async function AdminEventsPage() {
  const sessionUser = await getAuthSession()
  if (!sessionUser || (sessionUser.role !== "ADMIN1" && sessionUser.role !== "ADMIN2")) {
    redirect("/")
  }

  // Get the most recent event (we'll just use one main active event for simplicity)
  const latestEvent = await prisma.event.findFirst({
    orderBy: { createdAt: "desc" }
  })

  return (
    <>
      <TopAppBar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-32">
        <h1 className="text-headline-sm text-primary mb-2 font-bold">Banners de Eventos</h1>
        <p className="text-body-md text-secondary mb-8">
          Faça upload da imagem do próximo evento (proporção 4:5, 1080x1350px) para exibir na Home.
        </p>

        <EventForm existingEvent={latestEvent} userId={sessionUser.id} />
      </main>
      <BottomNavBar role={sessionUser.role} />
    </>
  )
}
