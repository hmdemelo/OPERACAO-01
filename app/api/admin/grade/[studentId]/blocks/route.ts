import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const createBlockSchema = z.object({
    subjectV2Id: z.string().min(1),
})

export async function POST(req: Request, props: { params: Promise<{ studentId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { studentId } = await props.params

    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    try {
        const body = createBlockSchema.parse(await req.json())

        const grid = await prisma.studyGrid.upsert({
            where: { userId: studentId },
            create: { userId: studentId },
            update: {},
        })

        const last = await prisma.studyBlock.findFirst({
            where: { gridId: grid.id },
            orderBy: { order: "desc" },
            select: { order: true },
        })

        const catalog = await prisma.subjectV2.findUnique({
            where: { id: body.subjectV2Id },
            include: {
                contents: {
                    orderBy: { order: "asc" },
                    include: { topics: { orderBy: { order: "asc" } } },
                },
            },
        })

        if (!catalog) {
            return new NextResponse("Disciplina não encontrada no catálogo V2", { status: 404 })
        }

        const block = await prisma.studyBlock.create({
            data: {
                gridId: grid.id,
                subjectV2Id: body.subjectV2Id,
                order: (last?.order ?? -1) + 1,
                contentBlocks: {
                    create: catalog.contents.map((content, ci) => {
                        const topicsData = content.topics.map((topic, ti) => {
                            const hasText = Boolean(topic.defaultText && topic.defaultText.trim())
                            return {
                                topicV2Id: topic.id,
                                customText: topic.defaultText,
                                order: ti,
                                visible: hasText,
                            }
                        })
                        const anyVisibleTopic = topicsData.some((t) => t.visible)
                        return {
                            contentV2Id: content.id,
                            order: ci,
                            visible: anyVisibleTopic,
                            topicBlocks: { create: topicsData },
                        }
                    }),
                },
            },
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
        })

        return NextResponse.json(block)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno do Servidor", { status: 500 })
    }
}
