-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "description" VARCHAR(2048);

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" VARCHAR(2048);
