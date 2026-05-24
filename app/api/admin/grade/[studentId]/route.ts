import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const gridInclude = {
    blocks: {
        orderBy: { order: "asc" as const },
        include: {
            subjectV2: { select: { id: true, name: true } },
            contentBlocks: {
                orderBy: { order: "asc" as const },
                include: {
                    contentV2: { select: { id: true, name: true } },
                    topicBlocks: {
                        orderBy: { order: "asc" as const },
                        include: {
                            topicV2: { select: { id: true, title: true, defaultText: true } },
                        },
                    },
                },
            },
        },
    },
}

export async function GET(req: Request, props: { params: Promise<{ studentId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { studentId } = await props.params

    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const grid = await prisma.studyGrid.upsert({
        where: { userId: studentId },
        create: { userId: studentId },
        update: {},
        include: gridInclude,
    })

    return NextResponse.json(grid)
}
