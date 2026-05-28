-- CreateTable
CREATE TABLE "SubjectColorPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectV2Id" TEXT NOT NULL,
    "color" VARCHAR(9) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectColorPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectColorPreference_userId_subjectV2Id_key" ON "SubjectColorPreference"("userId", "subjectV2Id");

-- CreateIndex
CREATE INDEX "SubjectColorPreference_userId_idx" ON "SubjectColorPreference"("userId");

-- AddForeignKey
ALTER TABLE "SubjectColorPreference" ADD CONSTRAINT "SubjectColorPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectColorPreference" ADD CONSTRAINT "SubjectColorPreference_subjectV2Id_fkey" FOREIGN KEY ("subjectV2Id") REFERENCES "SubjectV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
