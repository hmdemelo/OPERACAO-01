import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const createSchema = z.object({
    studentId: z.string().min(1),
    title: z.string().min(1).max(120),
    date: z.string().min(1),
    studyBlockIds: z.array(z.string()).min(1),
})

// GET /api/admin/simulations?studentId=xxx — list simulations for a student
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    if (!studentId) return new NextResponse("studentId obrigatório", { status: 400 })

    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const grid = await prisma.studyGrid.findUnique({ where: { userId: studentId }, select: { id: true } })
    if (!grid) return NextResponse.json([])

    const simulations = await prisma.simulation.findMany({
        where: { gridId: grid.id },
        orderBy: { date: "desc" },
        include: {
            blocks: {
                include: {
                    studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                },
            },
        },
    })

    return NextResponse.json(simulations)
}

// POST /api/admin/simulations — create simulation
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = createSchema.parse(await req.json())

    if (!(await canManageStudentGrade(session.user, body.studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const grid = await prisma.studyGrid.findUnique({ where: { userId: body.studentId }, select: { id: true } })
    if (!grid) return new NextResponse("Grade não encontrada", { status: 404 })

    const simulation = await prisma.simulation.create({
        data: {
            gridId: grid.id,
            title: body.title,
            date: new Date(body.date),
            blocks: {
                create: body.studyBlockIds.map((studyBlockId) => ({ studyBlockId })),
            },
        },
        include: {
            blocks: {
                include: {
                    studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                },
            },
        },
    })

    return NextResponse.json(simulation)
}
