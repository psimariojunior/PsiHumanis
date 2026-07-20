-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "MedicalRecord_sessionId_idx" ON "MedicalRecord"("sessionId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TherapySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
