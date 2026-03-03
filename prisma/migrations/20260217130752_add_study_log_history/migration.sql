-- CreateTable
CREATE TABLE "StudyLogHistory" (
    "id" TEXT NOT NULL,
    "studyLogId" TEXT NOT NULL,
    "previousValues" JSONB NOT NULL,
    "newValues" JSONB NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyLogHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyLogHistory_studyLogId_idx" ON "StudyLogHistory"("studyLogId");

-- CreateIndex
CREATE INDEX "StudyLogHistory_changedById_idx" ON "StudyLogHistory"("changedById");

-- AddForeignKey
ALTER TABLE "StudyLogHistory" ADD CONSTRAINT "StudyLogHistory_studyLogId_fkey" FOREIGN KEY ("studyLogId") REFERENCES "StudyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyLogHistory" ADD CONSTRAINT "StudyLogHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
