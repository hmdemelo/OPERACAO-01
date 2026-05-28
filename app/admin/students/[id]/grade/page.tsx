import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { StudyGridEditor } from "@/components/admin/StudyGridEditor"
import { SimulationEditor } from "@/components/admin/v2/SimulationEditor"
import { Fase2Viewer } from "@/components/admin/v2/Fase2Viewer"
import { CycleManager } from "@/components/admin/v2/CycleManager"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminStudentGradePage({ params }: PageProps) {
    console.log("[GRADE PAGE] Start")
    const session = await getServerSession(authOptions)
    console.log("[GRADE PAGE] Session:", { hasSession: !!session, role: session?.user?.role })

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const { id } = await params
    console.log("[GRADE PAGE] Student ID:", id)

    if (!(await canManageStudentGrade(session.user, id))) {
        redirect("/admin/schedules")
    }

    let student, grid, subjects, simulations, allCycles
    try {
        console.log("[GRADE PAGE] Fetching data...")
        ;[student, grid, subjects, simulations, allCycles] = await Promise.all([
            prisma.user.findUnique({ where: { id }, select: { name: true } }),
            prisma.studyGrid.findFirst({
                where: { userId: id, active: true },
                include: {
                    blocks: {
                        orderBy: { order: "asc" },
                        include: {
                            subjectV2: { select: { id: true, name: true } },
                            contentBlocks: {
                                orderBy: { order: "asc" },
                                include: {
                                    contentV2: { select: { id: true, name: true } },
                                    topicBlocks: {
                                        orderBy: { order: "asc" },
                                        include: {
                                            topicV2: { select: { id: true, title: true, defaultText: true } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.subjectV2.findMany({
                where: { active: true },
                orderBy: [{ order: "asc" }, { name: "asc" }],
                select: { id: true, name: true },
            }),
            prisma.simulation.findMany({
                where: { grid: { userId: id, active: true } },
                orderBy: { date: "desc" },
                include: {
                    blocks: {
                        include: {
                            studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                        },
                    },
                },
            }),
            prisma.studyGrid.findMany({
                where: { userId: id },
                orderBy: { cycleNumber: "asc" },
                select: {
                    id: true,
                    cycleNumber: true,
                    cycleLabel: true,
                    active: true,
                    completedAt: true,
                    createdAt: true,
                    blocks: {
                        where: { visible: true },
                        select: {
                            contentBlocks: {
                                where: { visible: true },
                                select: {
                                    topicBlocks: {
                                        where: { visible: true },
                                        select: { completed: true },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        ])
        console.log("[GRADE PAGE] Data fetched:", {
            hasStudent: !!student,
            hasActiveGrid: !!grid,
            blocks: grid?.blocks.length ?? 0,
            subjects: subjects.length,
            simulations: simulations.length,
            cycles: allCycles.length,
        })
    } catch (error) {
        console.error("[GRADE PAGE ERROR]", error)
        throw error
    }

    console.log("[GRADE PAGE] Processing data...")
    const nameParts = student?.name?.split(" ") || []
    const formattedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0] || "Aluno"

    // Serialize blocks: strip createdAt/updatedAt Date fields before passing to Client Components
    const serializedBlocks = (grid?.blocks ?? []).map((b) => ({
        id: b.id,
        subjectV2Id: b.subjectV2Id,
        order: b.order,
        visible: b.visible,
        subjectV2: b.subjectV2,
        contentBlocks: b.contentBlocks.map((c) => ({
            id: c.id,
            contentV2Id: c.contentV2Id,
            order: c.order,
            visible: c.visible,
            contentV2: c.contentV2,
            topicBlocks: c.topicBlocks.map((t) => ({
                id: t.id,
                topicV2Id: t.topicV2Id,
                customText: t.customText,
                order: t.order,
                visible: t.visible,
                completed: t.completed,
                f2Bool1: t.f2Bool1,
                f2Bool2: t.f2Bool2,
                f2Bool3: t.f2Bool3,
                f2Bool4: t.f2Bool4,
                f2Bool5: t.f2Bool5,
                topicV2: t.topicV2,
            })),
        })),
    }))

    // Blocks available for simulations: visible blocks with at least one completed topic (Fase 1 progress)
    const availableBlocks = serializedBlocks
        .filter((b) =>
            b.visible &&
            b.contentBlocks.some((c) => c.topicBlocks.some((t) => t.completed))
        )
        .map((b) => ({ id: b.id, subjectV2: b.subjectV2 }))

    // Serialize simulations: strip all Date fields
    const serializedSimulations = simulations.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date.toISOString(),
        blocks: s.blocks.map((sb) => ({
            id: sb.id,
            studyBlockId: sb.studyBlockId,
            instructions: sb.instructions,
            studentNotes: sb.studentNotes,
            studentResult: sb.studentResult,
            studyBlock: {
                id: sb.studyBlock.id,
                subjectV2: sb.studyBlock.subjectV2,
            },
        })),
    }))

    // Blocks for Fase2 viewer: visible, has completed topics
    const fase2Blocks = serializedBlocks
        .filter((b) => b.visible)
        .map((b) => ({
            id: b.id,
            subjectV2: b.subjectV2,
            contentBlocks: b.contentBlocks
                .filter((c) => c.visible)
                .map((c) => ({
                    id: c.id,
                    contentV2: c.contentV2,
                    topicBlocks: c.topicBlocks.filter((t) => t.visible && t.completed),
                }))
                .filter((c) => c.topicBlocks.length > 0),
        }))
        .filter((b) => b.contentBlocks.length > 0)

    const cyclesSummary = allCycles.map((c) => {
        let total = 0
        let done = 0
        for (const b of c.blocks) {
            for (const cb of b.contentBlocks) {
                for (const tb of cb.topicBlocks) {
                    total++
                    if (tb.completed) done++
                }
            }
        }
        return {
            id: c.id,
            cycleNumber: c.cycleNumber,
            cycleLabel: c.cycleLabel,
            active: c.active,
            completedAt: c.completedAt ? c.completedAt.toISOString() : null,
            createdAt: c.createdAt.toISOString(),
            topicsDone: done,
            topicsTotal: total,
        }
    })

    const activeCycle = cyclesSummary.find((c) => c.active) ?? null
    const nextCycleNumber = (cyclesSummary.reduce((m, c) => Math.max(m, c.cycleNumber), 0) || 0) + 1

    console.log("[GRADE PAGE] Rendering with:", {
        blocks: serializedBlocks.length,
        fase2Blocks: fase2Blocks.length,
        availableBlocks: availableBlocks.length,
        simulations: serializedSimulations.length,
        cycles: cyclesSummary.length,
    })

    return (
        <div className="space-y-4">
            <a
                href="/admin/v2/students"
                className="text-sm font-medium hover:underline text-muted-foreground flex items-center gap-1"
            >
                ← Voltar para Alunos V2
            </a>

            <h1 className="text-2xl font-black uppercase tracking-tighter">{formattedName}</h1>

            <Tabs defaultValue="fase1">
                <TabsList>
                    <TabsTrigger value="fase1">Fase 1</TabsTrigger>
                    <TabsTrigger value="fase2">Fase 2</TabsTrigger>
                    <TabsTrigger value="fase3">Fase 3</TabsTrigger>
                </TabsList>

                <TabsContent value="fase1" className="mt-4 space-y-8">
                    <CycleManager
                        studentId={id}
                        cycles={cyclesSummary}
                        nextCycleNumber={nextCycleNumber}
                    />

                    <div className="border-t pt-6">
                        <h2 className="text-lg font-bold mb-1">Grade do ciclo ativo</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {activeCycle
                                ? `Editando a grade do Ciclo ${activeCycle.cycleNumber} — ${activeCycle.cycleLabel}.`
                                : "Crie um ciclo acima para editar a grade do aluno."}
                        </p>
                        {activeCycle ? (
                            <StudyGridEditor
                                studentId={id}
                                studentName={formattedName}
                                subjects={subjects}
                                initialBlocks={serializedBlocks}
                            />
                        ) : (
                            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                                Sem ciclo ativo.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="fase2" className="mt-4">
                    <Fase2Viewer blocks={fase2Blocks} />
                </TabsContent>

                <TabsContent value="fase3" className="mt-4">
                    <SimulationEditor
                        studentId={id}
                        initialSimulations={serializedSimulations}
                        availableBlocks={availableBlocks}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
