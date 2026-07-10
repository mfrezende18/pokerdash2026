-- DropForeignKey
ALTER TABLE "BuyIn" DROP CONSTRAINT "BuyIn_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "CashOut" DROP CONSTRAINT "CashOut_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "BuyIn" ADD CONSTRAINT "BuyIn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOut" ADD CONSTRAINT "CashOut_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
