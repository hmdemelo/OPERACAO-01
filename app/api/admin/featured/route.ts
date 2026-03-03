
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    role: z.string().min(1, "Função é obrigatória"),
    quote: z.string().min(1, "Depoimento é obrigatório"),
    imageUrl: z.string().min(1, "Imagem é obrigatória"),
    active: z.boolean().default(true),
    order: z.number().int().default(0)
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const students = await prisma.featuredStudent.findMany({
            orderBy: { order: "asc" }
        })
        return NextResponse.json(students)
    } catch (error) {
        logger.error(error)
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
        const body = createSchema.parse(json)

        // Find the max order to append at the end
        const lastStudent = await prisma.featuredStudent.findFirst({
            orderBy: { order: "desc" }
        })
        const newOrder = (lastStudent?.order ?? -1) + 1

        const newStudent = await prisma.featuredStudent.create({
            data: {
                ...body,
                order: body.order || newOrder // Use provided order if any, otherwise append (though schema default is 0, logic overrides)
            }
        })

        return NextResponse.json(newStudent)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error(error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
