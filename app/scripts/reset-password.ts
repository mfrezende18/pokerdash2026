import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const phone = '11999999999'
  const newPassword = 'admin123'

  // Buscar usuário pelo telefone
  const user = await prisma.user.findUnique({ where: { phone } })
  
  if (!user) {
    console.log(`❌ Nenhum usuário encontrado com telefone: ${phone}`)
    // Listar todos os usuários com telefone
    const usersWithPhone = await prisma.user.findMany({
      where: { phone: { not: null } },
      select: { id: true, name: true, phone: true, role: true }
    })
    console.log('\n📋 Usuários com telefone cadastrado:')
    console.table(usersWithPhone)
    return
  }

  console.log(`✅ Usuário encontrado: ${user.name} (role: ${user.role})`)

  // Resetar senha
  const hash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { phone },
    data: { passwordHash: hash }
  })

  console.log(`🔑 Senha resetada para: ${newPassword}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
