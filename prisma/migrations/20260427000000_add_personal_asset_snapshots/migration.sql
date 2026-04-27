-- CreateTable
CREATE TABLE "PersonalAssetSnapshot" (
    "dbId" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "ownerOpenId" TEXT NOT NULL,
    "dataScope" TEXT NOT NULL DEFAULT 'real',
    "recordDate" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    "assets" JSONB NOT NULL DEFAULT '[]',
    "loans" JSONB NOT NULL DEFAULT '[]',
    "cards" JSONB NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalAssetSnapshot_ownerOpenId_dataScope_id_key" ON "PersonalAssetSnapshot"("ownerOpenId", "dataScope", "id");

-- CreateIndex
CREATE INDEX "PersonalAssetSnapshot_ownerOpenId_dataScope_recordDate_idx" ON "PersonalAssetSnapshot"("ownerOpenId", "dataScope", "recordDate");

-- CreateIndex
CREATE INDEX "PersonalAssetSnapshot_ownerOpenId_dataScope_updatedAt_idx" ON "PersonalAssetSnapshot"("ownerOpenId", "dataScope", "updatedAt");
