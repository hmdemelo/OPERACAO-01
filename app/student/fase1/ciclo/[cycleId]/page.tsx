import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { CycleBranchChart, type BranchSlice } from "@/components/student/grade/CycleBranchChart"
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
                            orderBy: { order: "asc" },
                            include: {
                                contentV2: { select: { name: true } },
                                topicBlocks: {
                                    where: { visible: true },
                                    orderBy: { order: "asc" },
                                    include: { topicV2: { select: { title: true } } },
                                },
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

    const slices: BranchSlice[] = grid.blocks.map((b) => {
        const topics = b.contentBlocks.flatMap((c) => c.topicBlocks)
        const done = topics.filter((t) => t.completed).length
        const contents = b.contentBlocks
            .map((c) => ({
                name: c.contentV2.name,
                topics: c.topicBlocks
                    .filter((t) => t.completed)
                    .map((t) => t.topicV2.title),
            }))
            .filter((c) => c.topics.length > 0)
        return {
            id: b.id,
            subjectV2Id: b.subjectV2.id,
            label: b.subjectV2.name,
            color: colorBySubject.get(b.subjectV2.id) ?? defaultColorForId(b.subjectV2.id),
            done,
            total: topics.length,
            contents,
        }
    })

    const completedLabel = grid.completedAt
        ? `Encerrado em ${new Date(grid.completedAt).toLocaleDateString("pt-BR")}`
        : "Encerrado"

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Fase 1", href: "/student/fase1" },
                    { label: grid.cycleLabel },
                ]}
            />
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    <span>Ciclo {grid.cycleNumber}</span>
                    <span>·</span>
                    <span>{completedLabel}</span>
                    <span className="border border-border rounded px-2 py-0.5 text-[10px] normal-case tracking-normal font-semibold">
                        Modo de leitura
                    </span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">
                    {grid.cycleLabel}
                </h1>
            </div>
            {slices.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center">Ciclo sem conteúdos.</p>
            ) : (
                <div className="flex justify-center overflow-x-auto">
                    <CycleBranchChart slices={slices} />
                </div>
            )}
        </div>
    )
}
