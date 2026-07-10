"use server"

import { prisma } from "@/lib/db"

export async function getDetailedSession(id: string) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      buyIns: {
        include: { player: true }
      },
      cashOuts: {
        include: { player: true }
      },
    }
  })
  
  return JSON.parse(JSON.stringify(session))
}
