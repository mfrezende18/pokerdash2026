import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const RAW_DATA = `
ADLER
08/06/2026: Prejuízo de R$ 130
AISLA
27/01/2026: Lucro de R$ 150
ANDRÉ
27/01/2026: Lucro de R$ 25
ANDREI
27/01/2026: Prejuízo de R$ 165
02/02/2026: Prejuízo de R$ 26
09/02/2026: Lucro de R$ 66
18/02/2026: Lucro de R$ 235
03/03/2026: Lucro de R$ 130
09/03/2026: Lucro de R$ 220
06/04/2026: Empate (R$ 0)
13/04/2026: Prejuízo de R$ 240
22/04/2026: Lucro de R$ 60
27/04/2026: Prejuízo de R$ 200
18/05/2026: Lucro de R$ 615
25/05/2026: Lucro de R$ 175
26/05/2026: Lucro de R$ 130
01/06/2026: Prejuízo de R$ 300
08/06/2026: Prejuízo de R$ 200
10/06/2026: Lucro de R$ 300
BARONI
22/04/2026: Prejuízo de R$ 100
27/04/2026: Lucro de R$ 180
BARRIGA
27/01/2026: Lucro de R$ 220
02/02/2026: Prejuízo de R$ 15
09/02/2026: Lucro de R$ 225
18/02/2026: Lucro de R$ 107
09/03/2026: Lucro de R$ 57
16/03/2026: Prejuízo de R$ 19
13/04/2026: Lucro de R$ 200
22/04/2026: Prejuízo de R$ 150
18/05/2026: Lucro de R$ 390
25/05/2026: Lucro de R$ 12
26/05/2026: Lucro de R$ 58
01/06/2026: Lucro de R$ 261
08/06/2026: Prejuízo de R$ 200
10/06/2026: Lucro de R$ 192
BRENNO
02/02/2026: Prejuízo de R$ 60
09/02/2026: Prejuízo de R$ 43
13/04/2026: Lucro de R$ 630
27/04/2026: Prejuízo de R$ 72
25/05/2026: Prejuízo de R$ 250
BRUNO
06/04/2026: Prejuízo de R$ 250
13/04/2026: Prejuízo de R$ 120
DIGÃO
09/03/2026: Prejuízo de R$ 400
16/03/2026: Lucro de R$ 23
23/03/2026: Lucro de R$ 162
06/04/2026: Prejuízo de R$ 160
13/04/2026: Prejuízo de R$ 100
18/05/2026: Lucro de R$ 15
25/05/2026: Lucro de R$ 185
01/06/2026: Prejuízo de R$ 79
08/06/2026: Lucro de R$ 203
FELIPE
27/01/2026: Lucro de R$ 265
02/02/2026: Prejuízo de R$ 128
09/02/2026: Prejuízo de R$ 187
18/02/2026: Lucro de R$ 11
03/03/2026: Prejuízo de R$ 150
09/03/2026: Lucro de R$ 99
16/03/2026: Prejuízo de R$ 121
23/03/2026: Prejuízo de R$ 50
06/04/2026: Lucro de R$ 570
13/04/2026: Empate (R$ 0)
22/04/2026: Prejuízo de R$ 30
27/04/2026: Lucro de R$ 66
18/05/2026: Prejuízo de R$ 250
25/05/2026: Prejuízo de R$ 99
01/06/2026: Lucro de R$ 235
10/06/2026: Prejuízo de R$ 70
FÁBIO
08/06/2026: Prejuízo de R$ 60
GABRIEL
09/03/2026: Prejuízo de R$ 47
GUSTAVO
27/01/2026: Prejuízo de R$ 20
02/02/2026: Lucro de R$ 95
09/02/2026: Prejuízo de R$ 80
18/02/2026: Lucro de R$ 58
03/03/2026: Lucro de R$ 194
09/03/2026: Prejuízo de R$ 166
16/03/2026: Prejuízo de R$ 30
23/03/2026: Prejuízo de R$ 88
06/04/2026: Prejuízo de R$ 20
13/04/2026: Prejuízo de R$ 310
22/04/2026: Empate (R$ 0)
27/04/2026: Lucro de R$ 296
18/05/2026: Lucro de R$ 25
25/05/2026: Prejuízo de R$ 350
26/05/2026: Lucro de R$ 250
01/06/2026: Lucro de R$ 164
GUTI
25/05/2026: Prejuízo de R$ 108
10/06/2026: Prejuízo de R$ 169
JOÃO M.
27/01/2026: Prejuízo de R$ 220
02/02/2026: Lucro de R$ 60
09/02/2026: Prejuízo de R$ 74
18/02/2026: Prejuízo de R$ 149
03/03/2026: Lucro de R$ 3
09/03/2026: Prejuízo de R$ 29
16/03/2026: Lucro de R$ 61
23/03/2026: Lucro de R$ 121
06/04/2026: Prejuízo de R$ 315
13/04/2026: Prejuízo de R$ 100
22/04/2026: Prejuízo de R$ 24
27/04/2026: Prejuízo de R$ 400
18/05/2026: Prejuízo de R$ 100
25/05/2026: Lucro de R$ 152
26/05/2026: Lucro de R$ 11
01/06/2026: Prejuízo de R$ 150
08/06/2026: Lucro de R$ 453
10/06/2026: Prejuízo de R$ 60
JUNINHO
27/01/2026: Prejuízo de R$ 50
LEO
08/06/2026: Prejuízo de R$ 50
LEONARDO C.
27/01/2026: Prejuízo de R$ 105
18/02/2026: Prejuízo de R$ 17
13/04/2026: Lucro de R$ 100
18/05/2026: Prejuízo de R$ 50
MARCELO
27/01/2026: Prejuízo de R$ 50
16/03/2026: Prejuízo de R$ 32
27/04/2026: Lucro de R$ 492
MF
27/01/2026: Lucro de R$ 130
02/02/2026: Lucro de R$ 153
09/02/2026: Lucro de R$ 96
18/02/2026: Prejuízo de R$ 140
03/03/2026: Lucro de R$ 28
09/03/2026: Lucro de R$ 2
16/03/2026: Prejuízo de R$ 42
23/03/2026: Prejuízo de R$ 365
06/04/2026: Prejuízo de R$ 205
13/04/2026: Lucro de R$ 270
22/04/2026: Lucro de R$ 109
27/04/2026: Prejuízo de R$ 300
18/05/2026: Prejuízo de R$ 200
25/05/2026: Lucro de R$ 336
26/05/2026: Prejuízo de R$ 75
01/06/2026: Lucro de R$ 194
08/06/2026: Lucro de R$ 95
10/06/2026: Prejuízo de R$ 500
PIRA
10/06/2026: Lucro de R$ 54
RODOLFO
01/06/2026: Prejuízo de R$ 150
RONALDO
27/01/2026: Prejuízo de R$ 84
03/03/2026: Prejuízo de R$ 205
16/03/2026: Lucro de R$ 210
23/03/2026: Prejuízo de R$ 41
06/04/2026: Lucro de R$ 720
13/04/2026: Prejuízo de R$ 240
22/04/2026: Prejuízo de R$ 300
27/04/2026: Prejuízo de R$ 192
25/05/2026: Prejuízo de R$ 250
26/05/2026: Prejuízo de R$ 200
01/06/2026: Prejuízo de R$ 92
08/06/2026: Prejuízo de R$ 350
10/06/2026: Prejuízo de R$ 170
THIAGO
27/01/2026: Prejuízo de R$ 100
02/02/2026: Prejuízo de R$ 159
09/02/2026: Prejuízo de R$ 50
18/02/2026: Prejuízo de R$ 150
09/03/2026: Lucro de R$ 152
16/03/2026: Prejuízo de R$ 200
23/03/2026: Lucro de R$ 166
06/04/2026: Prejuízo de R$ 100
13/04/2026: Lucro de R$ 10
22/04/2026: Lucro de R$ 275
27/04/2026: Prejuízo de R$ 48
18/05/2026: Prejuízo de R$ 245
25/05/2026: Prejuízo de R$ 98
26/05/2026: Prejuízo de R$ 363
01/06/2026: Prejuízo de R$ 246
08/06/2026: Lucro de R$ 100
10/06/2026: Prejuízo de R$ 95
VINI
09/02/2026: Prejuízo de R$ 100
09/03/2026: Prejuízo de R$ 43
06/04/2026: Prejuízo de R$ 100
13/04/2026: Prejuízo de R$ 100
27/04/2026: Prejuízo de R$ 100
18/05/2026: Prejuízo de R$ 350
26/05/2026: Lucro de R$ 128
01/06/2026: Prejuízo de R$ 17
10/06/2026: Lucro de R$ 518
VITAO
10/06/2026: Prejuízo de R$ 200
`

interface SessionData {
  date: string
  results: { player: string; result: number }[]
}

function parseData() {
  const lines = RAW_DATA.trim().split('\n')
  let currentPlayer = ''
  
  // Agrupar por data da sessão
  const sessionsMap = new Map<string, { player: string; result: number }[]>()
  
  for (const line of lines) {
    if (!line.includes(':')) {
      currentPlayer = line.trim()
      continue
    }
    
    // Ex: "08/06/2026: Prejuízo de R$ 130" or "06/04/2026: Empate (R$ 0)"
    const [datePart, rest] = line.split(':')
    const date = datePart.trim()
    
    let result = 0
    if (rest.includes('Lucro de R$')) {
      result = parseInt(rest.split('Lucro de R$')[1].trim())
    } else if (rest.includes('Prejuízo de R$')) {
      result = -parseInt(rest.split('Prejuízo de R$')[1].trim())
    } else if (rest.includes('Empate')) {
      result = 0
    }
    
    if (!sessionsMap.has(date)) {
      sessionsMap.set(date, [])
    }
    sessionsMap.get(date)!.push({ player: currentPlayer, result })
  }
  
  // Converter as datas em objetos SessionData para ordenação temporal
  const parsedSessions: SessionData[] = Array.from(sessionsMap.entries()).map(([dateStr, results]) => {
    return { date: dateStr, results }
  })
  
  // Sort temporally
  parsedSessions.sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/')
    const [d2, m2, y2] = b.date.split('/')
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime()
  })
  
  return parsedSessions
}

async function main() {
  console.log('🌱 Recriando banco com logs históricos exatos...')

  // Limpar banco
  await prisma.cashOut.deleteMany()
  await prisma.buyIn.deleteMany()
  await prisma.highlight.deleteMany()
  await prisma.event.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Criar Admin "MF"
  const adminHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'MF',
      email: 'admin@poker.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8UjX_u8I__Bh7iB_7uIBx856qATLZSDXJ12WmqaNeZKT80zYOJIGNll8-OJCheb_ExmJ5EKA_zyEXK666x7DEkSdB0smXqXX6o_mfBzuwlKb9pJOTx-5Pr3udJoyM8Nfzr0WVN4pu7INhyYS6NdPKLkszxGzEywPFNTgbj_Dq-tHFSpDERzo8-QgvyF64HtshfawhInRvqYoUHQcGSrZWMVggQssir_z6gScrLQSo79XJ-tLUgYkoqp95FFbHS8vOGeOFIXXK_QM',
    },
  })

  const dbUsers = new Map<string, string>()
  dbUsers.set('MF', admin.id)

  const parsedSessions = parseData()
  
  // Criar jogadores faltantes dinamicamente
  const allPlayerNames = new Set<string>()
  for (const s of parsedSessions) {
    for (const r of s.results) {
      allPlayerNames.add(r.player)
    }
  }

  for (const pName of Array.from(allPlayerNames)) {
    if (pName === 'MF') continue
    const user = await prisma.user.create({
      data: { name: pName, role: 'USER' },
    })
    dbUsers.set(pName, user.id)
  }

  // Criar as sessões com as datas certas
  for (let i = 0; i < parsedSessions.length; i++) {
    const sData = parsedSessions[i]
    const [d, m, y] = sData.date.split('/')
    const sessionDate = new Date(`${y}-${m}-${d}T20:00:00.000Z`) // Assume mesas começam as 20h UTC

    const session = await prisma.session.create({
      data: {
        name: `Sessão Oficial ${sData.date}`,
        blinds: '1/2',
        rakeType: 'PERCENT',
        rakePercent: 5,
        status: 'CLOSED',
        startedAt: sessionDate,
        closedAt: new Date(sessionDate.getTime() + 5 * 60 * 60 * 1000), // +5 horas
        createdById: admin.id,
      },
    })

    // Inserir os buy-ins e cash-outs desta sessão
    for (const { player, result } of sData.results) {
      const userId = dbUsers.get(player)!
      
      // Matemática: Se perder, o buyin tem que cobrir a perda inteira.
      // Vamos usar R$ 200 como buyin base (ou mais se a perda for maior).
      const buyInAmount = Math.max(200, -result)
      const cashOutValue = buyInAmount + result // Garante q cashOut >= 0 e netResult == result

      await prisma.buyIn.create({
        data: {
          sessionId: session.id,
          playerId: userId,
          amount: buyInAmount,
          type: 'INITIAL',
          createdAt: session.startedAt
        }
      })

      await prisma.cashOut.create({
        data: {
          sessionId: session.id,
          playerId: userId,
          chipValue: cashOutValue,
          netResult: result,
          createdAt: session.closedAt!
        }
      })
    }
  }

  console.log('✅ Base repopulada com HISTÓRICO EXATO DE 18 SESSÕES:')
  console.log(`   - ${parsedSessions.length} Partidas mapeadas por data`)
  console.log(`   - ${allPlayerNames.size} Jogadores`)
  console.log('   - Gráficos de lucro ao longo do tempo agora são reais.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
