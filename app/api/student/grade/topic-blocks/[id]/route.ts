import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
    completed: z.boolean().optional(),
    f2Bool1: z.boolean().optional(),
    f2Bool2: z.boolean().optional(),
    f2Bool3: z.boolean().optional(),
    f2Bool4: z.boolean().optional(),
    f2Bool5: z.boolean().optional(),
})

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await props.params
    try {
        const body = updateSchema.parse(await req.json())

        const topicBlock = await prisma.studyTopicBlock.findUnique({
            where: { id },
            include: {
                contentBlock: { include: { block: { include: { grid: { select: { userId: true } } } } } },
            },
        })

        if (!topicBlock) {
            return new NextResponse("Não encontrado", { status: 404 })
        }

        if (topicBlock.contentBlock.block.grid.userId !== session.user.id) {
            return new NextResponse("Acesso negado", { status: 403 })
        }

        const updated = await prisma.studyTopicBlock.update({ where: { id }, data: body })
        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
