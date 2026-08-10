import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const SESSIONS = [
  {
    name: "Sessão 30/06",
    date: new Date("2026-06-30T22:00:00Z"),
    rake: 300,
    players: [
      { name: "MF", buyins: [50, 50], cashout: 306 },
      { name: "RONALDO", buyins: [50, 50, 50, 50], cashout: 44 },
      { name: "PEDRO LEBRON", buyins: [50, 50, 50], cashout: 0 },
      { name: "RAFAEL", buyins: [50], cashout: 25 },
      { name: "DIGÃO", buyins: [50, 50, 50], cashout: 235 },
      { name: "ADLER", buyins: [50, 50, 50, 50], cashout: 111 },
      { name: "JOÃO M.", buyins: [50, 50], cashout: 105 },
      { name: "THIAGO", buyins: [50, 50, 50, 50, 50, 50], cashout: 0 },
      { name: "GUSTAVO", buyins: [50, 50, 50, 50], cashout: 375 },
    ]
  },
  {
    name: "Sessão 06/07 FE",
    date: new Date("2026-07-06T22:00:00Z"),
    rake: 150,
    players: [
      { name: "MF", buyins: [50], cashout: 170 },
      { name: "JOÃO M.", buyins: [50, 50], cashout: 340 },
      { name: "BARRIGA", buyins: [50, 50, 50, 50], cashout: 262 },
      { name: "FELIPE", buyins: [50, 50, 50, 50, 50], cashout: 300 },
      { name: "VINI", buyins: [50, 50, 50], cashout: 0 },
      { name: "RONALDO", buyins: [50, 50, 59, 50, 50, 50], cashout: 177 },
      { name: "DIGÃO", buyins: [50, 50, 50], cashout: 110 },
      { name: "ADLER", buyins: [50, 50], cashout: 0 },
      { name: "GUSTAVO", buyins: [50, 50, 50, 50, 100], cashout: 100 },
    ]
  },
  {
    name: "Sessão 08/07 GU",
    date: new Date("2026-07-08T22:00:00Z"),
    rake: 200,
    players: [
      { name: "MF", buyins: [50, 100, 50], cashout: 516 },
      { name: "RONALDO", buyins: [50, 50, 50], cashout: 0 },
      { name: "JOÃO M.", buyins: [50, 50, 50], cashout: 0 },
      { name: "PEDRO LEBRON", buyins: [50, 50], cashout: 176 },
      { name: "ADLER", buyins: [50, 50, 50], cashout: 191 },
      { name: "FABIO", buyins: [50], cashout: 50 },
      { name: "GUSTAVO", buyins: [50, 50, 50], cashout: 264 },
      { name: "DIGÃO", buyins: [50, 50, 50, 50, 50, 50, 100], cashout: 453 },
      { name: "BARRIGA", buyins: [50, 50, 50, 50, 50, 50], cashout: 0 },
      { name: "ANDREI", buyins: [50, 50, 50, 50, 50], cashout: 50 },
    ]
  },
  {
    name: "Sessão 13/07",
    date: new Date("2026-07-13T22:00:00Z"),
    rake: 150,
    players: [
      { name: "MF", buyins: [50], cashout: 60 },
      { name: "THIAGO", buyins: [50, 50, 50, 50], cashout: 204 },
      { name: "ADLER", buyins: [50, 50, 50], cashout: 0 },
      { name: "ANDREI", buyins: [50, 50], cashout: 100 },
      { name: "FELIPE", buyins: [50, 50], cashout: 240 },
      { name: "BARRIGA", buyins: [50, 50, 50, 100], cashout: 226 },
      { name: "RONALDO", buyins: [100, 50, 50, 50, 50, 50], cashout: 50 },
      { name: "DIGÃO", buyins: [50, 50], cashout: 200 },
      { name: "LEONARDO C.", buyins: [50, 50], cashout: 250 },
      { name: "JOÃO M.", buyins: [50], cashout: 150 },
      { name: "GUSTAVO", buyins: [50, 50, 100], cashout: 20 },
    ]
  },
  {
    name: "Sessão 14/07",
    date: new Date("2026-07-14T22:00:00Z"),
    rake: 250,
    players: [
      { name: "ADLER", buyins: [20, 20, 20, 40, 50], cashout: 0 },
      { name: "MORGADO", buyins: [20, 50, 100], cashout: 480 },
      { name: "PEDRO", buyins: [20, 50, 50], cashout: 0 },
      { name: "RAFAEL D.", buyins: [20, 50, 30, 100], cashout: 0 },
      { name: "RAFAEL CALDATO", buyins: [20], cashout: 127 },
      { name: "RONALDO", buyins: [20, 20, 100, 100, 60, 50, 50, 50], cashout: 0 },
      { name: "BARRIGA", buyins: [20, 50, 50, 100], cashout: 433 },
      { name: "DIGÃO", buyins: [20, 50, 80], cashout: 451 },
      { name: "JOÃO", buyins: [50, 50, 50, 50, 50], cashout: 250 },
      { name: "FABIO", buyins: [20, 30], cashout: 0 },
      { name: "LEO", buyins: [20, 30], cashout: 0 },
    ]
  },
  {
    name: "Sessão 04/08",
    date: new Date("2026-08-04T22:00:00Z"),
    rake: 180,
    players: [
      { name: "MF", buyins: [20, 100], cashout: 160 },
      { name: "BARRIGA", buyins: [20, 50, 100, 100, 100, 50], cashout: 115 },
      { name: "JUNIOR", buyins: [50, 50], cashout: 100 },
      { name: "PEDRO LEBRO", buyins: [20, 50, 100], cashout: 155 },
      { name: "RONALDO", buyins: [20, 50], cashout: 100 },
      { name: "MARCELO", buyins: [20], cashout: 117 },
      { name: "DIGAO", buyins: [20, 50, 80, 50], cashout: 65 },
      { name: "THIAGO", buyins: [20, 50, 50, 50], cashout: 400 },
      { name: "JOÃO M.", buyins: [20, 50, 100], cashout: 588 },
      { name: "GUSTAVO", buyins: [20, 50, 50, 80, 100], cashout: 60 },
      { name: "ANDREI", buyins: [100, 100, 100], cashout: 0 },
    ]
  }
]

async function getOrCreatePlayer(name: string) {
  // Try exact match or similar names
  let user = await prisma.user.findFirst({
    where: { 
      name: { equals: name, mode: 'insensitive' },
      role: { not: "DELETED" }
    }
  })

  // Attempt to match names like "JOÃO" vs "JOÃO M."
  if (!user) {
    const allUsers = await prisma.user.findMany({ where: { role: { not: "DELETED" } } })
    user = allUsers.find(u => 
      u.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(u.name.toLowerCase())
    ) || null
  }

  if (!user) {
    console.log(`[+] Criando novo jogador: ${name}`)
    const passwordHash = await bcrypt.hash("mudar123", 10)
    user = await prisma.user.create({
      data: {
        name: name,
        passwordHash,
        requirePasswordChange: true,
        role: "USER"
      }
    })
  }

  return user
}

async function run() {
  for (const sessionData of SESSIONS) {
    console.log(`\nVerificando sessão: ${sessionData.name} - ${sessionData.date.toISOString()}`)
    
    // Convert to start of day to avoid timezone matching issues
    const dateStart = new Date(sessionData.date)
    dateStart.setHours(0,0,0,0)
    const dateEnd = new Date(sessionData.date)
    dateEnd.setHours(23,59,59,999)

    const existingSessions = await prisma.session.findMany({
      where: {
        startedAt: { gte: dateStart, lte: dateEnd }
      },
      include: {
        _count: { select: { buyIns: true } }
      }
    })

    const populatedSession = existingSessions.find(s => s._count.buyIns > 0)

    if (populatedSession) {
      console.log(`[!] Sessão na data ${sessionData.date.toISOString()} já existe e possui dados (ID: ${populatedSession.id}). Ignorando.`)
      continue
    }

    // Delete any empty ghost sessions for this date
    const emptySessions = existingSessions.filter(s => s._count.buyIns === 0)
    for (const empty of emptySessions) {
      console.log(`[-] Removendo sessão vazia (fantasma) ID: ${empty.id}...`)
      await prisma.session.delete({ where: { id: empty.id } })
    }

    console.log(`[+] Criando sessão ${sessionData.name}...`)
    
    const startedAt = sessionData.date
    const closedAt = new Date(sessionData.date)
    closedAt.setHours(closedAt.getHours() + 4) // 4 hours later

    // Get an actual admin
    const admin = await prisma.user.findFirst({ where: { role: { in: ["ADMIN1", "ADMIN2"] } } })
    const createdByConnect = admin ? { connect: { id: admin.id } } : undefined

    const newSession = await prisma.session.create({
      data: {
        name: sessionData.name,
        startedAt,
        closedAt,
        status: "CLOSED",
        rakeCollected: sessionData.rake,
        createdBy: createdByConnect
      }
    })

    // Add players, buyins, cashouts
    for (const p of sessionData.players) {
      const user = await getOrCreatePlayer(p.name)

      let totalBuyin = 0
      for (let i = 0; i < p.buyins.length; i++) {
        const amount = p.buyins[i]
        totalBuyin += amount
        await prisma.buyIn.create({
          data: {
            amount,
            type: i === 0 ? "INITIAL" : "REBUY",
            status: "APPROVED",
            player: { connect: { id: user.id } },
            session: { connect: { id: newSession.id } },
            createdAt: new Date(startedAt.getTime() + i * 1000 * 60 * 30) // staggered every 30 mins
          }
        })
      }

      const netResult = p.cashout - totalBuyin
      await prisma.cashOut.create({
        data: {
          chipValue: p.cashout,
          netResult: netResult,
          player: { connect: { id: user.id } },
          session: { connect: { id: newSession.id } },
          createdAt: closedAt
        }
      })
    }

    console.log(`[✓] Sessão ${sessionData.name} importada com sucesso.`)
  }

  console.log("\n[+] Importação concluída!")
}

run().catch(console.error).finally(() => prisma.$disconnect())
