import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const updateBlockSchema = z.object({
    order: z.number().int().optional(),
    visible: z.boolean().optional(),
})

export async function PUT(req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { blockId } = await props.params

    try {
        const body = updateBlockSchema.parse(await req.json())

        const block = await prisma.studyBlock.findUnique({
            where: { id: blockId },
            include: { grid: { select: { userId: true } } },
        })

        if (!block) {
            return new NextResponse("Bloco não encontrado", { status: 404 })
        }

        if (!(await canManageStudentGrade(session.user, block.grid.userId))) {
            return new NextResponse("Acesso negado", { status: 403 })
        }

        const updated = await prisma.studyBlock.update({
            where: { id: blockId },
            data: body,
        })

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno do Servidor", { status: 500 })
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { blockId } = await props.params

    const block = await prisma.studyBlock.findUnique({
        where: { id: blockId },
        include: { grid: { select: { userId: true } } },
    })

    if (!block) {
        return new NextResponse("Bloco não encontrado", { status: 404 })
    }

    if (!(await canManageStudentGrade(session.user, block.grid.userId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    await prisma.studyBlock.delete({ where: { id: blockId } })

    return new NextResponse(null, { status: 204 })
}
