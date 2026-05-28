import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { PieChart, type Slice } from "@/components/student/grade/PieChart"
import { Breadcrumb } from "@/components/student/grade/Breadcrumb"
import { CycleAchievements } from "@/components/student/grade/CycleAchievements"
import { defaultColorForId } from "@/lib/dashboard/visualTokens"

export default async function Fase1Page() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const [activeGrid, allGrids, colorPrefs] = await Promise.all([
        prisma.studyGrid.findFirst({
            where: { userId: session.user.id, active: true },
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
        prisma.studyGrid.findMany({
            where: { userId: session.user.id, active: false },
            orderBy: { cycleNumber: "asc" },
            select: {
                id: true,
                cycleNumber: true,
                cycleLabel: true,
                completedAt: true,
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
        prisma.subjectColorPreference.findMany({
            where: { userId: session.user.id },
            select: { subjectV2Id: true, color: true },
        }),
    ])

    const colorBySubject = new Map(colorPrefs.map(p => [p.subjectV2Id, p.color]))

    const slices: Slice[] = (activeGrid?.blocks ?? []).map((b) => {
        const topics = b.contentBlocks.flatMap((c) => c.topicBlocks)
        const done = topics.filter((t) => t.completed).length
        return {
            id: b.id,
            subjectV2Id: b.subjectV2.id,
            label: b.subjectV2.name,
            color: colorBySubject.get(b.subjectV2.id) ?? defaultColorForId(b.subjectV2.id),
            done,
            total: topics.length,
            href: `/student/fase1/${b.id}`,
        }
    })

    const achievements = allGrids.map((g) => {
        let total = 0
        let done = 0
        for (const b of g.blocks) {
            for (const cb of b.contentBlocks) {
                for (const tb of cb.topicBlocks) {
                    total++
                    if (tb.completed) done++
                }
            }
        }
        return {
            id: g.id,
            cycleNumber: g.cycleNumber,
            cycleLabel: g.cycleLabel,
            completedAt: g.completedAt ? g.completedAt.toISOString() : null,
            pct: total > 0 ? Math.round((done / total) * 100) : 0,
            done,
            total,
        }
    })

    const cycleTitle = activeGrid
        ? `Ciclo ${activeGrid.cycleNumber} — ${activeGrid.cycleLabel}`
        : null

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb items={[{ label: "Fase 1" }]} />
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Fase 1</h1>
                {cycleTitle && (
                    <p className="text-sm text-muted-foreground">{cycleTitle}</p>
                )}
            </div>

            <div className={achievements.length > 0 ? "grid gap-6 md:grid-cols-[1fr_280px]" : ""}>
                <div>
                    {!activeGrid ? (
                        <p className="text-muted-foreground py-10 text-center">
                            {achievements.length > 0
                                ? "Aguardando próximo ciclo do seu mentor."
                                : "Sua grade ainda não foi configurada. Fale com seu mentor."}
                        </p>
                    ) : slices.length === 0 ? (
                        <p className="text-muted-foreground py-10 text-center">
                            Este ciclo ainda não tem conteúdos. Fale com seu mentor.
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-sm mb-4">Clique em uma disciplina para ver os conteúdos.</p>
                    )}
                    {activeGrid && slices.length > 0 && (
                        <div className="flex justify-center">
                            <PieChart slices={slices} />
                        </div>
                    )}
                </div>

                {achievements.length > 0 && (
                    <CycleAchievements achievements={achievements} />
                )}
            </div>
        </div>
    )
}
