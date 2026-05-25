import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { StudyGridEditor } from "@/components/admin/StudyGridEditor"
import { SimulationEditor } from "@/components/admin/v2/SimulationEditor"
import { Fase2Viewer } from "@/components/admin/v2/Fase2Viewer"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminStudentGradePage({ params }: PageProps) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const { id } = await params

    if (!(await canManageStudentGrade(session.user, id))) {
        redirect("/admin/schedules")
    }

    const [student, grid, subjects, simulations] = await Promise.all([
        prisma.user.findUnique({ where: { id }, select: { name: true } }),
        prisma.studyGrid.upsert({
            where: { userId: id },
            create: { userId: id },
            update: {},
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
            where: { grid: { userId: id } },
            orderBy: { date: "desc" },
            include: {
                blocks: {
                    include: {
                        studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                    },
                },
            },
        }),
    ])

    const nameParts = student?.name?.split(" ") || []
    const formattedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0] || "Aluno"

    // Serialize blocks: strip createdAt/updatedAt Date fields before passing to Client Components
    const serializedBlocks = grid.blocks.map((b) => ({
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

    return (
        <div className="container mx-auto p-6 space-y-4">
            <a
                href="/admin/v2/students"
                className="text-sm font-medium hover:underline text-muted-foreground flex items-center gap-1"
            >
                ← Voltar para Alunos V2
            </a>

            <h1 className="text-2xl font-black uppercase tracking-tighter">{formattedName}</h1>

            <Tabs defaultValue="grade">
                <TabsList>
                    <TabsTrigger value="grade">Grade</TabsTrigger>
                    <TabsTrigger value="fase2">Fase 2</TabsTrigger>
                    <TabsTrigger value="fase3">Fase 3</TabsTrigger>
                </TabsList>

                <TabsContent value="grade" className="mt-4">
                    <StudyGridEditor
                        studentId={id}
                        studentName={formattedName}
                        subjects={subjects}
                        initialBlocks={serializedBlocks}
                    />
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
