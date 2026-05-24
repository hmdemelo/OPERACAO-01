import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { PieChart, type Slice } from "@/components/student/grade/PieChart"
import { Breadcrumb } from "@/components/student/grade/Breadcrumb"
import { colorForId } from "@/lib/grade/colors"

export default async function Fase1Page() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const grid = await prisma.studyGrid.findUnique({
        where: { userId: session.user.id },
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
    })

    const slices: Slice[] = (grid?.blocks ?? []).map((b) => {
        const topics = b.contentBlocks.flatMap((c) => c.topicBlocks)
        const done = topics.filter((t) => t.completed).length
        return {
            id: b.id,
            label: b.subjectV2.name,
            color: colorForId(b.id),
            done,
            total: topics.length,
            href: `/student/fase1/${b.id}`,
        }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb items={[{ label: "Fase 1" }]} />
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Fase 1</h1>
                <p className="text-muted-foreground text-sm">Clique em uma disciplina para ver os conteúdos.</p>
            </div>
            {slices.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center">
                    Sua grade ainda não foi configurada. Fale com seu mentor.
                </p>
            ) : (
                <div className="flex justify-center">
                    <PieChart slices={slices} />
                </div>
            )}
        </div>
    )
}
