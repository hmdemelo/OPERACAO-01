-- DropColumn: f3Notes / f3Result moved out of StudyBlock (replaced by Simulation model)
ALTER TABLE "StudyBlock" DROP COLUMN IF EXISTS "f3Notes";
ALTER TABLE "StudyBlock" DROP COLUMN IF EXISTS "f3Result";

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "gridId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationBlock" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "studyBlockId" TEXT NOT NULL,
    "instructions" TEXT,
    "studentNotes" VARCHAR(500),
    "studentResult" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Simulation_gridId_idx" ON "Simulation"("gridId");

-- CreateIndex
CREATE INDEX "SimulationBlock_simulationId_idx" ON "SimulationBlock"("simulationId");

-- CreateIndex
CREATE INDEX "SimulationBlock_studyBlockId_idx" ON "SimulationBlock"("studyBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationBlock_simulationId_studyBlockId_key" ON "SimulationBlock"("simulationId", "studyBlockId");

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "StudyGrid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationBlock" ADD CONSTRAINT "SimulationBlock_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationBlock" ADD CONSTRAINT "SimulationBlock_studyBlockId_fkey" FOREIGN KEY ("studyBlockId") REFERENCES "StudyBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
