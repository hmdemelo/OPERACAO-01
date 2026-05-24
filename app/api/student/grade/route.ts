import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const grid = await prisma.studyGrid.findUnique({
        where: { userId: session.user.id },
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
                                include: { topicV2: { select: { id: true, title: true } } },
                            },
                        },
                    },
                },
            },
        },
    })

    return NextResponse.json(grid)
}
