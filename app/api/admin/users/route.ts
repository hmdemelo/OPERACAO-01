import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"
import { Role } from "@prisma/client"
import { getMentorIdFilter } from "@/lib/auth/superAdmin"

const createUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(["ADMIN", "MENTOR", "STUDENT"]),
    password: z.string().min(6),
    phone: z.string().optional().nullable(),
    cpf: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable(),
    targetExam: z.string().optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    dailyHours: z.number().optional().nullable(),
    addressCity: z.string().optional().nullable(),
    addressState: z.string().optional().nullable(),
    mentorId: z.string().optional().nullable(),
    appVersion: z.enum(["v1", "v2"]).default("v1").optional(),
})

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const showInactive = searchParams.get("showInactive") === "true"

    try {
        // Mentor: only sees themselves + their own students
        // Admin: sees everyone (admins, mentors, students, orphans)
        const activeFilter = showInactive ? {} : { active: true }
        const mentorId = getMentorIdFilter({ id: session.user.id, role: session.user.role, email: session.user.email })

        // ADMIN sees everyone; MENTOR filtered by super-admin status sees everyone;
        // regular MENTOR sees only themselves + their own students
        const whereClause = mentorId
            ? {
                ...activeFilter,
                OR: [
                    { id: session.user.id },
                    { studentLink: { mentorId } } as any,
                ]
            }
            : activeFilter;

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    userSubjects: {
                        select: {
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    userConcursos: {
                        select: {
                            concurso: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    active: true,
                    appVersion: true,
                    // @ts-ignore
                    studentLink: {
                        select: {
                            mentorId: true,
                            mentor: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
            }),
            prisma.user.count({ where: whereClause }),
        ])

        return NextResponse.json({
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        return new NextResponse("Erro Interno do Servidor", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = createUserSchema.parse(json)

        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        })

        if (existingUser) {
            return new NextResponse("Usuário já existe", { status: 409 })
        }

        const passwordHash = await bcrypt.hash(body.password, 10)

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                role: body.role as any,
                passwordHash,
                phone: body.phone || null,
                cpf: body.cpf || null,
                birthDate: body.birthDate ? new Date(body.birthDate) : null,
                targetExam: body.targetExam || null,
                educationLevel: body.educationLevel || null,
                dailyHours: body.dailyHours ?? null,
                addressCity: body.addressCity || null,
                addressState: body.addressState || null,
                appVersion: body.role === "STUDENT" ? (body.appVersion ?? "v1") : "v1",
                ...(body.role === "STUDENT" && body.mentorId ? {
                    studentLink: {
                        create: {
                            mentorId: body.mentorId
                        }
                    }
                } : {})
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                appVersion: true,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[POST_USER_ERROR]", error)
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
