import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PieChart, type Slice } from "@/components/student/grade/PieChart"
import { Breadcrumb } from "@/components/student/grade/Breadcrumb"
import { defaultColorForId } from "@/lib/dashboard/visualTokens"

export default async function Fase1BlockPage(props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const { blockId } = await props.params

    const block = await prisma.studyBlock.findFirst({
        where: { id: blockId, grid: { userId: session.user.id, active: true }, visible: true },
        include: {
            subjectV2: { select: { id: true, name: true } },
            contentBlocks: {
                where: { visible: true },
                orderBy: { order: "asc" },
                include: {
                    contentV2: { select: { id: true, name: true } },
                    topicBlocks: { where: { visible: true } },
                },
            },
        },
    })

    if (!block) notFound()

    const colorPref = await prisma.subjectColorPreference.findUnique({
        where: { userId_subjectV2Id: { userId: session.user.id, subjectV2Id: block.subjectV2.id } },
        select: { color: true },
    })
    const color = colorPref?.color ?? defaultColorForId(block.subjectV2.id)
    const slices: Slice[] = block.contentBlocks.map((c) => {
        const done = c.topicBlocks.filter((t) => t.completed).length
        return {
            id: c.id,
            label: c.contentV2.name,
            color,
            done,
            total: c.topicBlocks.length,
            href: `/student/fase1/${block.id}/${c.id}`,
        }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Fase 1", href: "/student/fase1" },
                    { label: block.subjectV2.name },
                ]}
            />
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{block.subjectV2.name}</h1>
                <p className="text-muted-foreground text-sm">Clique em um conteúdo para marcar assuntos.</p>
            </div>
            {slices.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center">Nenhum conteúdo nesta disciplina.</p>
            ) : (
                <div className="flex justify-center">
                    <PieChart slices={slices} />
                </div>
            )}
        </div>
    )
}
