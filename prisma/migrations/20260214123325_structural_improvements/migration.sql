-- DropForeignKey
ALTER TABLE "StudyLog" DROP CONSTRAINT "StudyLog_contentId_fkey";

-- DropForeignKey
ALTER TABLE "StudyLog" DROP CONSTRAINT "StudyLog_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "StudyLog" DROP CONSTRAINT "StudyLog_userId_fkey";

-- CreateIndex
CREATE INDEX "Content_subjectId_idx" ON "Content"("subjectId");

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
