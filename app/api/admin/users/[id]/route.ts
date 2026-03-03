
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
        await prisma.user.delete({
            where: {
                id,
            },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logger.error("[USER_DELETE]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["ADMIN", "MENTOR", "STUDENT"]).optional(),
    active: z.boolean().optional(),
    phone: z.string().optional().nullable(),
    cpf: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable().transform(str => str ? new Date(str) : null),
    targetExam: z.string().optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    dailyHours: z.coerce.number().int().min(0).max(24).optional().nullable(),
    addressCity: z.string().optional().nullable(),
    addressState: z.string().optional().nullable(),
    subjectIds: z.array(z.string()).optional(),
    concursoIds: z.array(z.string()).optional(),
    mentorId: z.string().optional().nullable(),
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
        const body = updateUserSchema.parse(json)
        const { id } = await params

        // Delete existing relations
        if (body.subjectIds !== undefined) {
            await prisma.userSubject.deleteMany({ where: { userId: id } })
        }
        if (body.concursoIds !== undefined) {
            await prisma.userConcurso.deleteMany({ where: { userId: id } })
        }

        // Handle mentor link for students
        if (body.mentorId !== undefined) {
            // Delete existing link first
            await (prisma as any).mentorshipLink.deleteMany({ where: { studentId: id } })
            // Create new link if a mentor was selected
            if (body.mentorId) {
                await (prisma as any).mentorshipLink.create({
                    data: { studentId: id, mentorId: body.mentorId }
                })
            }
        }

        const user = await prisma.user.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                email: body.email,
                role: body.role as any,
                active: body.active,
                // Profile fields
                phone: body.phone || null,
                cpf: body.cpf || null,
                birthDate: body.birthDate ? new Date(body.birthDate) : null,
                targetExam: body.targetExam || null,
                educationLevel: body.educationLevel || null,
                dailyHours: body.dailyHours ?? null,
                addressCity: body.addressCity || null,
                addressState: body.addressState || null,
                // Relations
                ...(body.subjectIds !== undefined && {
                    userSubjects: {
                        create: body.subjectIds.map((subjectId) => ({ subjectId }))
                    }
                }),
                ...(body.concursoIds !== undefined && {
                    userConcursos: {
                        create: body.concursoIds.map((concursoId) => ({ concursoId }))
                    }
                })
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[USER_PATCH]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
