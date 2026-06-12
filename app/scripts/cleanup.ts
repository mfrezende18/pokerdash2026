import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Delete the "Poker de Segunda" session
  const session = await prisma.session.findFirst({
    where: { name: 'Poker de Segunda' }
  });
  
  if (session) {
    console.log("Deleting session:", session.name);
    await prisma.buyIn.deleteMany({ where: { sessionId: session.id }});
    await prisma.cashOut.deleteMany({ where: { sessionId: session.id }});
    await prisma.session.delete({ where: { id: session.id }});
    console.log("Session deleted.");
  }

  // 2. Set the 4 specific users to ADMIN2
  const admin2Names = ['FELIPE', 'GUSTAVO', 'JOÃO M.', 'MF'];
  for (const name of admin2Names) {
    // Only update the ones that don't have a phone number (the seed ones)
    await prisma.user.updateMany({
      where: { name, phone: null },
      data: { role: 'ADMIN2' }
    });
    console.log(`Updated ${name} to ADMIN2`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
