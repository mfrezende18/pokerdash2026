import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      phone: "1199999999"
    }
  });
  console.log("Users with phone 1199999999:", users.map(u => ({ id: u.id, name: u.name, role: u.role, phone: u.phone })));
  
  const allPhones = await prisma.user.findMany({
    select: { name: true, phone: true }
  });
  console.log("All phones:", allPhones.filter(u => u.phone));
}

main().catch(console.error).finally(() => prisma.$disconnect());
