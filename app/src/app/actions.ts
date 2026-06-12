"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addPlayerToSession(sessionId: string, playerId: string, amount: number) {
  await prisma.buyIn.create({
    data: {
      sessionId,
      playerId,
      amount,
      type: "INITIAL",
    },
  })
  
  revalidatePath("/")
}

export async function addRebuyToSession(sessionId: string, playerId: string, amount: number) {
  await prisma.buyIn.create({
    data: {
      sessionId,
      playerId,
      amount,
      type: "REBUY",
    },
  })
  
  revalidatePath("/")
}

export async function removePlayerFromSession(sessionId: string, playerId: string) {
  // Para fins do mock interativo, simplesmente remove os buy-ins do jogador desta sessão
  // Se fosse um sistema completo, deveríamos calcular o netResult, criar cashOut e encerrar o jogador
  
  await prisma.buyIn.deleteMany({
    where: {
      sessionId,
      playerId,
    }
  })
  
  revalidatePath("/")
}
