import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const testPlayers = [
    { name: 'Ronaldo', phone: '19984000782' },
    { name: 'MF', phone: '19983839306' }
  ]

  for (const player of testPlayers) {
    console.log(`Processando jogador ${player.name}...`)
    
    // Hash do telefone para ser usado como senha
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(player.phone, salt)

    // Tentar encontrar o usuário pelo nome (caso já tenha sido importado da planilha)
    const existingUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: player.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingUser) {
      console.log(`Jogador ${player.name} encontrado no banco. Atualizando telefone e senha...`)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          phone: player.phone,
          passwordHash: passwordHash,
          requirePasswordChange: true
        }
      })
      console.log(`✅ Jogador ${player.name} atualizado com sucesso.`)
    } else {
      console.log(`Jogador ${player.name} não encontrado no banco. Criando novo usuário...`)
      await prisma.user.create({
        data: {
          name: player.name,
          phone: player.phone,
          passwordHash: passwordHash,
          requirePasswordChange: true,
          role: 'USER'
        }
      })
      console.log(`✅ Jogador ${player.name} criado com sucesso.`)
    }
  }
}

main()
  .catch(e => {
    console.error('Erro ao popular usuários:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
