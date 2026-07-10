import { PrismaClient } from './node_modules/.prisma/client/index.js'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.izicrirzeqisloddluio:Mat20021998Hes@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function main() {
  const users = await prisma.user.findMany()
  console.log("Conectou com sucesso. Usuários:", users.length)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
