import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

export async function POST(_req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { blockId } = await props.params

    const block = await prisma.studyBlock.findUnique({
        where: { id: blockId },
        include: {
            grid: { select: { userId: true } },
            contentBlocks: {
                include: { topicBlocks: true },
            },
        },
    })

    if (!block) {
        return new NextResponse("Bloco não encontrado", { status: 404 })
    }

    if (!(await canManageStudentGrade(session.user, block.grid.userId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const catalog = await prisma.subjectV2.findUnique({
        where: { id: block.subjectV2Id },
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

    const existingContentByV2 = new Map(block.contentBlocks.map((c) => [c.contentV2Id, c]))
    let newContents = 0
    let newTopics = 0
    let updatedTexts = 0

    await prisma.$transaction(async (tx) => {
        // próxima ordem para conteúdos novos
        let nextContentOrder = block.contentBlocks.reduce((max, c) => Math.max(max, c.order), -1) + 1

        for (const catContent of catalog.contents) {
            const existingContent = existingContentByV2.get(catContent.id)

            if (!existingContent) {
                // conteúdo novo — cria com todos os tópicos
                const topicsData = catContent.topics.map((topic, ti) => {
                    const hasText = Boolean(topic.defaultText && topic.defaultText.trim())
                    return {
                        topicV2Id: topic.id,
                        customText: topic.defaultText,
                        order: ti,
                        visible: hasText,
                    }
                })
                const anyVisibleTopic = topicsData.some((t) => t.visible)

                await tx.studyContentBlock.create({
                    data: {
                        blockId: block.id,
                        contentV2Id: catContent.id,
                        order: nextContentOrder++,
                        visible: anyVisibleTopic,
                        topicBlocks: { create: topicsData },
                    },
                })
                newContents++
                newTopics += topicsData.length
            } else {
                // conteúdo já existe — verifica tópicos
                const existingTopicByV2 = new Map(existingContent.topicBlocks.map((t) => [t.topicV2Id, t]))
                let nextTopicOrder =
                    existingContent.topicBlocks.reduce((max, t) => Math.max(max, t.order), -1) + 1

                for (const catTopic of catContent.topics) {
                    const existingTopic = existingTopicByV2.get(catTopic.id)

                    if (!existingTopic) {
                        // tópico novo
                        const hasText = Boolean(catTopic.defaultText && catTopic.defaultText.trim())
                        await tx.studyTopicBlock.create({
                            data: {
                                contentBlockId: existingContent.id,
                                topicV2Id: catTopic.id,
                                customText: catTopic.defaultText,
                                order: nextTopicOrder++,
                                visible: hasText,
                            },
                        })
                        newTopics++
                    } else {
                        // tópico existe — atualiza customText apenas se vazio/nulo
                        const current = existingTopic.customText?.trim() ?? ""
                        const incoming = catTopic.defaultText?.trim() ?? ""
                        if (current === "" && incoming !== "" && current !== incoming) {
                            await tx.studyTopicBlock.update({
                                where: { id: existingTopic.id },
                                data: { customText: catTopic.defaultText },
                            })
                            updatedTexts++
                        }
                    }
                }
            }
        }
    })

    const refreshed = await prisma.studyBlock.findUnique({
        where: { id: block.id },
        include: {
            subjectV2: { select: { id: true, name: true } },
            contentBlocks: {
                orderBy: { order: "asc" },
                include: {
                    contentV2: { select: { id: true, name: true } },
                    topicBlocks: {
                        orderBy: { order: "asc" },
                        include: {
                            topicV2: { select: { id: true, title: true, defaultText: true } },
                        },
                    },
                },
            },
        },
    })

    return NextResponse.json({
        block: refreshed,
        summary: { newContents, newTopics, updatedTexts },
    })
}
