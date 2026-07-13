import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existingEvents = await prisma.event.findMany()
  if (existingEvents.length > 0) {
    console.log("Deletando eventos antigos...")
    await prisma.event.deleteMany()
  }

  // Pegar admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN1' } })
  if (!admin) {
    console.log("Admin1 não encontrado")
    return
  }

  const newEvent = await prisma.event.create({
    data: {
      title: "Resenha Series of Poker",
      description: "Próximo grande evento com 80L de chopp e muito mais!",
      imageUrl: "/flyer-resenha.jpg",
      ctaUrl: "https://chat.whatsapp.com/HgG5NySSz0hDUSlJTZ60fe?s=cl&p=i&ilr=4&amv=0",
      eventDate: new Date("2026-08-08T13:30:00Z"),
      createdById: admin.id,
    }
  })

  console.log("Evento criado com sucesso:", newEvent)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
