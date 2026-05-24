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

    // Blocks available for simulations: visible blocks with at least one completed topic (Fase 1 progress)
    const availableBlocks = grid.blocks
        .filter((b) =>
            b.visible &&
            b.contentBlocks.some((c) => c.topicBlocks.some((t) => t.completed))
        )
        .map((b) => ({ id: b.id, subjectV2: b.subjectV2 }))

    // Blocks for Fase2 viewer: visible, has completed topics with any f2 revision
    const fase2Blocks = grid.blocks
        .filter((b) => b.visible)
        .map((b) => ({
            ...b,
            contentBlocks: b.contentBlocks
                .filter((c) => c.visible)
                .map((c) => ({
                    ...c,
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
                        initialBlocks={grid.blocks}
                    />
                </TabsContent>

                <TabsContent value="fase2" className="mt-4">
                    <Fase2Viewer blocks={fase2Blocks} />
                </TabsContent>

                <TabsContent value="fase3" className="mt-4">
                    <SimulationEditor
                        studentId={id}
                        initialSimulations={simulations}
                        availableBlocks={availableBlocks}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
