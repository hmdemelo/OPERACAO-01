import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PieChart, type Slice } from "@/components/student/grade/PieChart"
import { Breadcrumb } from "@/components/student/grade/Breadcrumb"
import { defaultColorForId } from "@/lib/dashboard/visualTokens"

export default async function CycleArchivePage(props: { params: Promise<{ cycleId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/signin")

    const { cycleId } = await props.params

    const [grid, colorPrefs] = await Promise.all([
        prisma.studyGrid.findFirst({
            where: { id: cycleId, userId: session.user.id },
            include: {
                blocks: {
                    where: { visible: true },
                    orderBy: { order: "asc" },
                    include: {
                        subjectV2: { select: { id: true, name: true } },
                        contentBlocks: {
                            where: { visible: true },
                            include: {
                                topicBlocks: { where: { visible: true } },
                            },
                        },
                    },
                },
            },
        }),
        prisma.subjectColorPreference.findMany({
            where: { userId: session.user.id },
            select: { subjectV2Id: true, color: true },
        }),
    ])

    if (!grid) notFound()

    const colorBySubject = new Map(colorPrefs.map(p => [p.subjectV2Id, p.color]))

    const slices: Slice[] = grid.blocks.map((b) => {
        const topics = b.contentBlocks.flatMap((c) => c.topicBlocks)
        const done = topics.filter((t) => t.completed).length
        return {
            id: b.id,
            subjectV2Id: b.subjectV2.id,
            label: b.subjectV2.name,
            color: colorBySubject.get(b.subjectV2.id) ?? defaultColorForId(b.subjectV2.id),
            done,
            total: topics.length,
            // sem href — modo leitura
        }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Fase 1", href: "/student/fase1" },
                    { label: `Ciclo ${grid.cycleNumber}` },
                ]}
            />
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">
                    Ciclo {grid.cycleNumber} — {grid.cycleLabel}
                </h1>
                <p className="text-muted-foreground text-sm">
                    Modo de leitura. {grid.completedAt && `Concluído em ${new Date(grid.completedAt).toLocaleDateString("pt-BR")}.`}
                </p>
            </div>
            {slices.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center">Ciclo sem conteúdos.</p>
            ) : (
                <div className="flex justify-center">
                    <PieChart slices={slices} />
                </div>
            )}
        </div>
    )
}
