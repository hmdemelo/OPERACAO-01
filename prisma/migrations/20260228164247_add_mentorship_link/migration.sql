-- CreateTable
CREATE TABLE "MentorshipLink" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipLink_studentId_key" ON "MentorshipLink"("studentId");

-- CreateIndex
CREATE INDEX "MentorshipLink_mentorId_idx" ON "MentorshipLink"("mentorId");

-- CreateIndex
CREATE INDEX "MentorshipLink_studentId_idx" ON "MentorshipLink"("studentId");

-- AddForeignKey
ALTER TABLE "MentorshipLink" ADD CONSTRAINT "MentorshipLink_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipLink" ADD CONSTRAINT "MentorshipLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
