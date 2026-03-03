import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { logger } from "@/lib/logger"

const academicUpdateSchema = z.object({
    subjectIds: z.array(z.string()),
    concursoIds: z.array(z.string()),
})

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                userSubjects: {
                    select: { subjectId: true }
                },
                userConcursos: {
                    select: { concursoId: true }
                }
            }
        })

        return NextResponse.json({
            subjectIds: user?.userSubjects.map(s => s.subjectId) || [],
            concursoIds: user?.userConcursos.map(c => c.concursoId) || []
        })
    } catch (error) {
        logger.error("[ACADEMIC_GET]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = academicUpdateSchema.parse(json)
        const id = session.user.id

        // Use transaction to ensure consistency
        await prisma.$transaction([
            prisma.userSubject.deleteMany({ where: { userId: id } }),
            prisma.userConcurso.deleteMany({ where: { userId: id } }),
            prisma.userSubject.createMany({
                data: body.subjectIds.map(subjectId => ({
                    userId: id,
                    subjectId
                }))
            }),
            prisma.userConcurso.createMany({
                data: body.concursoIds.map(concursoId => ({
                    userId: id,
                    concursoId
                }))
            })
        ])

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[ACADEMIC_PATCH]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
