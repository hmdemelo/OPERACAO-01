-- DropTable: legacy V1 grid tables (no-op for envs that never had them)
DROP TABLE IF EXISTS "StudySubBlock" CASCADE;
DROP TABLE IF EXISTS "StudyBlock" CASCADE;
DROP TABLE IF EXISTS "StudyGrid" CASCADE;

-- CreateTable: StudyGrid (V2 per-user grid container)
CREATE TABLE "StudyGrid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyGrid_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudyGrid_userId_key" ON "StudyGrid"("userId");
ALTER TABLE "StudyGrid" ADD CONSTRAINT "StudyGrid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SubjectV2
CREATE TABLE "SubjectV2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubjectV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ContentV2
CREATE TABLE "ContentV2" (
    "id" TEXT NOT NULL,
    "subjectV2Id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentV2_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContentV2_subjectV2Id_idx" ON "ContentV2"("subjectV2Id");

-- CreateTable: TopicV2
CREATE TABLE "TopicV2" (
    "id" TEXT NOT NULL,
    "contentV2Id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "defaultText" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TopicV2_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TopicV2_contentV2Id_idx" ON "TopicV2"("contentV2Id");

-- CreateTable: StudyBlock (recriado com nova estrutura)
CREATE TABLE "StudyBlock" (
    "id" TEXT NOT NULL,
    "gridId" TEXT NOT NULL,
    "subjectV2Id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "f3Notes" VARCHAR(255),
    "f3Result" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StudyBlock_gridId_idx" ON "StudyBlock"("gridId");
CREATE INDEX "StudyBlock_subjectV2Id_idx" ON "StudyBlock"("subjectV2Id");

-- CreateTable: StudyContentBlock
CREATE TABLE "StudyContentBlock" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "contentV2Id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyContentBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StudyContentBlock_blockId_idx" ON "StudyContentBlock"("blockId");
CREATE INDEX "StudyContentBlock_contentV2Id_idx" ON "StudyContentBlock"("contentV2Id");

-- CreateTable: StudyTopicBlock
CREATE TABLE "StudyTopicBlock" (
    "id" TEXT NOT NULL,
    "contentBlockId" TEXT NOT NULL,
    "topicV2Id" TEXT NOT NULL,
    "customText" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "f2Bool1" BOOLEAN NOT NULL DEFAULT false,
    "f2Bool2" BOOLEAN NOT NULL DEFAULT false,
    "f2Bool3" BOOLEAN NOT NULL DEFAULT false,
    "f2Bool4" BOOLEAN NOT NULL DEFAULT false,
    "f2Bool5" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyTopicBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StudyTopicBlock_contentBlockId_idx" ON "StudyTopicBlock"("contentBlockId");
CREATE INDEX "StudyTopicBlock_topicV2Id_idx" ON "StudyTopicBlock"("topicV2Id");

-- Foreign Keys
ALTER TABLE "ContentV2" ADD CONSTRAINT "ContentV2_subjectV2Id_fkey" FOREIGN KEY ("subjectV2Id") REFERENCES "SubjectV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopicV2" ADD CONSTRAINT "TopicV2_contentV2Id_fkey" FOREIGN KEY ("contentV2Id") REFERENCES "ContentV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyBlock" ADD CONSTRAINT "StudyBlock_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "StudyGrid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyBlock" ADD CONSTRAINT "StudyBlock_subjectV2Id_fkey" FOREIGN KEY ("subjectV2Id") REFERENCES "SubjectV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudyContentBlock" ADD CONSTRAINT "StudyContentBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "StudyBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyContentBlock" ADD CONSTRAINT "StudyContentBlock_contentV2Id_fkey" FOREIGN KEY ("contentV2Id") REFERENCES "ContentV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudyTopicBlock" ADD CONSTRAINT "StudyTopicBlock_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "StudyContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyTopicBlock" ADD CONSTRAINT "StudyTopicBlock_topicV2Id_fkey" FOREIGN KEY ("topicV2Id") REFERENCES "TopicV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
