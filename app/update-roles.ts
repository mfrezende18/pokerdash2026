import { prisma } from "./src/lib/db"
import bcrypt from "bcryptjs"

async function main() {
  const defaultPassword = await bcrypt.hash("mudar123", 10)

  // 1. Atualizar MF (Admin 1)
  // Existe um MF com '19983839306' no banco de dados. Vamos garantir as permissões e a senha.
  const mf = await prisma.user.findFirst({ where: { phone: "19983839306" } })
  if (mf) {
    await prisma.user.update({
      where: { id: mf.id },
      data: {
        role: "ADMIN1",
        passwordHash: defaultPassword,
        requirePasswordChange: true
      }
    })
    console.log("MF atualizado para ADMIN1.")
  }

  // 2. Atualizar JOÃO M. (Admin 2) - login: 19991103284
  const joao = await prisma.user.findFirst({ where: { name: "JOÃO M." } })
  if (joao) {
    await prisma.user.update({
      where: { id: joao.id },
      data: {
        phone: "19991103284",
        role: "ADMIN2",
        passwordHash: defaultPassword,
        requirePasswordChange: true
      }
    })
    console.log("JOÃO M. atualizado para ADMIN2.")
  }

  // 3. Atualizar RONALDO (Admin 3) - login: 19984000782
  const ronaldo = await prisma.user.findFirst({ where: { name: "RONALDO" } })
  if (ronaldo) {
    await prisma.user.update({
      where: { id: ronaldo.id },
      data: {
        phone: "19984000782",
        role: "ADMIN3",
        passwordHash: defaultPassword,
        requirePasswordChange: true
      }
    })
    console.log("RONALDO atualizado para ADMIN3.")
  }

  console.log("Todos os usuários atualizados com sucesso!")
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
