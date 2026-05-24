import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().optional(),
    active: z.boolean().optional(),
})

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    const { id } = await props.params
    try {
        const body = updateSchema.parse(await req.json())
        const subject = await prisma.subjectV2.update({ where: { id }, data: body })
        return NextResponse.json(subject)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Apenas ADMIN pode excluir disciplinas do catálogo", { status: 403 })
    }
    const { id } = await props.params

    const inUse = await prisma.studyBlock.count({ where: { subjectV2Id: id } })
    if (inUse > 0) {
        return new NextResponse(
            `Disciplina em uso por ${inUse} aluno(s). Desative-a em vez de excluir.`,
            { status: 409 }
        )
    }

    await prisma.subjectV2.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
}
