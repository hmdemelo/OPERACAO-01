
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createConcursoSchema = z.object({
    name: z.string().min(2),
    description: z.string().max(2048).optional(),
    active: z.boolean().default(true),
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const concursos = await prisma.concurso.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        })

        return NextResponse.json(concursos)
    } catch (error) {
        logger.error("[CONCURSOS_GET]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = createConcursoSchema.parse(json)

        const concurso = await prisma.concurso.create({
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
        logger.error("[CONCURSOS_POST]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
