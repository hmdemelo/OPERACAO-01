-- Ciclos da Fase 1: um aluno passa a ter N StudyGrids (um por ciclo),
-- mas só um active=true por vez. Grids existentes viram "Ciclo 1".

ALTER TABLE "StudyGrid"
    ADD COLUMN "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "cycleLabel" VARCHAR(60),
    ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "completedAt" TIMESTAMP(3);

-- Grids pré-existentes recebem um label padrão (campo passa a ser obrigatório
-- a partir das próximas inserções via app — o DEFAULT é só para o backfill).
UPDATE "StudyGrid" SET "cycleLabel" = 'Ciclo 1' WHERE "cycleLabel" IS NULL;
ALTER TABLE "StudyGrid" ALTER COLUMN "cycleLabel" SET NOT NULL;

-- Remove o unique antigo (um grid por aluno) e garante que continue valendo
-- "no máximo um grid ativo por aluno".
DROP INDEX IF EXISTS "StudyGrid_userId_key";

CREATE UNIQUE INDEX "StudyGrid_userId_active_unique"
    ON "StudyGrid" ("userId")
    WHERE "active" = true;

CREATE INDEX "StudyGrid_userId_idx" ON "StudyGrid" ("userId");
