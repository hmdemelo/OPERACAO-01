
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"



export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.concurso.delete({
            where: {
                id,
            },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logger.error("[CONCURSO_DELETE]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

const updateConcursoSchema = z.object({
    name: z.string().min(2),
    description: z.string().max(2048).optional(),
    active: z.boolean(),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = updateConcursoSchema.parse(json)
        const { id } = await params

        const concurso = await prisma.concurso.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                description: body.description,
                active: body.active,
            },
        })

        return NextResponse.json(concurso)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[CONCURSO_PATCH]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

