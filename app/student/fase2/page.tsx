import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Fase2View } from "@/components/student/grade/Fase2View"

export default async function Fase2Page() {
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
                        orderBy: { order: "asc" },
                        include: {
                            contentV2: { select: { id: true, name: true } },
                            topicBlocks: {
                                where: { visible: true, completed: true },
                                orderBy: { order: "asc" },
                                include: { topicV2: { select: { id: true, title: true } } },
                            },
                        },
                    },
                },
            },
        },
    })

    const blocks = (grid?.blocks ?? [])
        .map((b) => ({
            ...b,
            contentBlocks: b.contentBlocks.filter((c) => c.topicBlocks.length > 0),
        }))
        .filter((b) => b.contentBlocks.length > 0)

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Fase 2</h1>
                <p className="text-muted-foreground text-sm">Caderno de erros — assuntos concluídos na Fase 1.</p>
            </div>
            <Fase2View initialBlocks={blocks} />
        </div>
    )
}
