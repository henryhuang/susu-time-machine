-- CreateTable
CREATE TABLE "MiniProgramUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "openId" TEXT,
    "unionId" TEXT,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "remark" TEXT,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "lastCheckedAt" DATETIME,
    "lastAllowedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MiniProgramUser_openId_key" ON "MiniProgramUser"("openId");

-- CreateIndex
CREATE UNIQUE INDEX "MiniProgramUser_unionId_key" ON "MiniProgramUser"("unionId");

-- CreateIndex
CREATE INDEX "MiniProgramUser_allowed_updatedAt_idx" ON "MiniProgramUser"("allowed", "updatedAt");

-- CreateIndex
CREATE INDEX "MiniProgramUser_nickname_idx" ON "MiniProgramUser"("nickname");
