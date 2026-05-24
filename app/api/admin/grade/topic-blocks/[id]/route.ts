import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const updateSchema = z.object({
    visible: z.boolean().optional(),
    customText: z.string().max(255).nullable().optional(),
    order: z.number().int().optional(),
})

async function resolveOwner(id: string) {
    return prisma.studyTopicBlock.findUnique({
        where: { id },
        include: {
            contentBlock: { include: { block: { include: { grid: { select: { userId: true } } } } } },
        },
    })
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    const { id } = await props.params
    try {
        const body = updateSchema.parse(await req.json())
        const owner = await resolveOwner(id)
        if (!owner) return new NextResponse("Não encontrado", { status: 404 })
        if (!(await canManageStudentGrade(session.user, owner.contentBlock.block.grid.userId))) {
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
