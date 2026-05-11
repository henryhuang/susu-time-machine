-- AlterTable
ALTER TABLE "Story" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
