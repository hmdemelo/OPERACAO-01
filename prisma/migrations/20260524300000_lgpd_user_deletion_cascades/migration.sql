-- LGPD: permitir hard delete de User mantendo questões e auditoria de histórico
-- Em vez de bloquear a exclusão por FK, marca o autor como NULL (SetNull).

-- Question.uploadedBy: tornar opcional + SetNull
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_uploadedById_fkey";
ALTER TABLE "Question" ALTER COLUMN "uploadedById" DROP NOT NULL;
ALTER TABLE "Question" ADD CONSTRAINT "Question_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Question.approvedBy: já é opcional, apenas trocar a FK para SetNull
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_approvedById_fkey";
ALTER TABLE "Question" ADD CONSTRAINT "Question_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- StudyLogHistory.changedBy: tornar opcional + SetNull
ALTER TABLE "StudyLogHistory" DROP CONSTRAINT IF EXISTS "StudyLogHistory_changedById_fkey";
ALTER TABLE "StudyLogHistory" ALTER COLUMN "changedById" DROP NOT NULL;
ALTER TABLE "StudyLogHistory" ADD CONSTRAINT "StudyLogHistory_changedById_fkey"
    FOREIGN KEY ("changedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
