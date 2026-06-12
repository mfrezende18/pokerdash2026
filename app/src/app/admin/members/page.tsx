export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { MembersList } from "@/components/features/MembersList"

async function getMembers() {
  const users = await prisma.user.findMany({
    include: {
      buyIns: true,
      cashOuts: true,
    },
    orderBy: { name: "asc" },
  })

  return users.map((user) => {
    const totalSessions = new Set(user.buyIns.map((b) => b.sessionId)).size
    const totalProfit = user.cashOuts.reduce((sum, c) => sum + c.netResult, 0)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      totalSessions,
      totalProfit,
      hasAccount: !!user.email,
      inviteToken: user.inviteToken,
    }
  })
}

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <>
      <TopAppBar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-headline-lg text-primary">Membros</h1>
          <p className="text-body-lg text-secondary mt-1">
            Gerenciar jogadores e convites
          </p>
        </div>

        <MembersList members={members} />
      </main>

      <BottomNavBar />
    </>
  )
}
