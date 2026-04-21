-- AlterTable
ALTER TABLE "MiniProgramUser" ADD COLUMN "applicationSubmittedAt" DATETIME;

-- CreateIndex
CREATE INDEX "MiniProgramUser_applicationSubmittedAt_idx" ON "MiniProgramUser"("applicationSubmittedAt");
