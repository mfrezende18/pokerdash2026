import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function run() {
  const morgado = await prisma.user.findFirst({
    where: { name: { equals: "MORGADO", mode: "insensitive" } }
  })

  const gustavo = await prisma.user.findFirst({
    where: { name: { equals: "GUSTAVO", mode: "insensitive" } }
  })

  if (!morgado) {
    console.log("[-] Jogador MORGADO não encontrado.")
    return
  }
  if (!gustavo) {
    console.log("[-] Jogador GUSTAVO não encontrado.")
    return
  }

  console.log(`[+] Encontrado MORGADO (ID: ${morgado.id}) e GUSTAVO (ID: ${gustavo.id})`)

  // Transfer BuyIns
  const buyinsUpdated = await prisma.buyIn.updateMany({
    where: { playerId: morgado.id },
    data: { playerId: gustavo.id }
  })
  console.log(`[✓] Transferidos ${buyinsUpdated.count} Buy-ins de MORGADO para GUSTAVO.`)

  // Transfer CashOuts
  const cashoutsUpdated = await prisma.cashOut.updateMany({
    where: { playerId: morgado.id },
    data: { playerId: gustavo.id }
  })
  console.log(`[✓] Transferidos ${cashoutsUpdated.count} Cash-outs de MORGADO para GUSTAVO.`)

  // Delete MORGADO
  await prisma.user.delete({
    where: { id: morgado.id }
  })
  console.log(`[✓] Usuário MORGADO deletado com sucesso.`)
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
