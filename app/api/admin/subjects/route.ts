import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSubjectSchema = z.object({
    name: z.string().min(2),
    description: z.string().max(2048).optional(),
    active: z.boolean().default(true),
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
        orderBy: { name: "asc" },
        include: {
            contents: {
                orderBy: { createdAt: 'asc' } // Ensure contents are ordered
            },
            _count: {
                select: { users: true },
            },
        },
    })

    return NextResponse.json(subjects)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 }) // Consistent translation
    }

    try {
        const json = await req.json()
        const body = createSubjectSchema.parse(json)

        const subject = await prisma.subject.create({
            data: {
                name: body.name,
                description: body.description,
                active: body.active,
            },
        })

        // Automatically create 'Questões' content for the new subject
        await prisma.content.create({
            data: {
                name: "Questões",
                description: "Resolução de questões práticas e simulados",
                subjectId: subject.id,
            },
        })

        return NextResponse.json(subject)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno do Servidor", { status: 500 })
    }
}
