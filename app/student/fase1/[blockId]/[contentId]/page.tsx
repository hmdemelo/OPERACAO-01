import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { TopicsChecklist } from "@/components/student/grade/TopicsChecklist"
import { Breadcrumb } from "@/components/student/grade/Breadcrumb"

export default async function Fase1ContentPage(props: {
    params: Promise<{ blockId: string; contentId: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const { blockId, contentId } = await props.params

    const content = await prisma.studyContentBlock.findFirst({
        where: {
            id: contentId,
            visible: true,
            block: { id: blockId, visible: true, grid: { userId: session.user.id, active: true } },
        },
        include: {
            contentV2: { select: { id: true, name: true } },
            block: { include: { subjectV2: { select: { id: true, name: true } } } },
            topicBlocks: {
                where: { visible: true },
                orderBy: { order: "asc" },
                include: { topicV2: { select: { id: true, title: true } } },
            },
        },
    })

    if (!content) notFound()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: "Fase 1", href: "/student/fase1" },
                    { label: content.block.subjectV2.name, href: `/student/fase1/${blockId}` },
                    { label: content.contentV2.name },
                ]}
            />
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{content.contentV2.name}</h1>
            </div>
            <TopicsChecklist
                contentName={content.contentV2.name}
                initialTopics={content.topicBlocks.map((t) => ({
                    id: t.id,
                    customText: t.customText,
                    completed: t.completed,
                    topicV2: t.topicV2,
                }))}
            />
        </div>
    )
}
