import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { InviteForm } from "./InviteForm"

interface InvitePageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="bg-surface-container-lowest p-8 rounded-3xl apple-shadow w-[90vw] max-w-[400px]">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h1 className="text-title-lg text-primary mb-2">Convite Inválido</h1>
          <p className="text-secondary text-body-sm">
            Este link de convite não existe ou já foi utilizado. Peça ao administrador para gerar um novo.
          </p>
        </div>
      </div>
    )
  }

  if (user.inviteTokenExpiry && new Date() > user.inviteTokenExpiry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="bg-surface-container-lowest p-8 rounded-3xl apple-shadow w-[90vw] max-w-[400px]">
          <span className="material-symbols-outlined text-warning text-5xl mb-4">timer</span>
          <h1 className="text-title-lg text-primary mb-2">Convite Expirado</h1>
          <p className="text-secondary text-body-sm">
            O tempo de validade deste convite acabou. Peça ao administrador para gerar um novo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="w-[90vw] max-w-[400px] z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface-container-high rounded-2xl mx-auto mb-6 flex items-center justify-center apple-shadow border border-surface-variant/30">
            <span className="material-symbols-outlined text-primary text-3xl">waving_hand</span>
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Olá, {user.name}!</h1>
          <p className="text-secondary mt-2">Complete seu cadastro para acessar a mesa</p>
        </div>

        <InviteForm token={token} />
      </div>
    </main>
  )
}
