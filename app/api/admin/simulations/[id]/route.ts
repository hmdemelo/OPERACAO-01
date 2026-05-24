import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const updateSchema = z.object({
    title: z.string().min(1).max(120).optional(),
    date: z.string().min(1).optional(),
})

async function getSimWithAuth(id: string, user: { id: string; role: string; email?: string | null }) {
    const sim = await prisma.simulation.findUnique({
        where: { id },
        include: { grid: { select: { userId: true } } },
    })
    if (!sim) return null
    const ok = await canManageStudentGrade(user, sim.grid.userId)
    return ok ? sim : null
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await props.params
    const sim = await getSimWithAuth(id, session.user)
    if (!sim) return new NextResponse("Não encontrado ou acesso negado", { status: 404 })

    const body = updateSchema.parse(await req.json())
    const updated = await prisma.simulation.update({
        where: { id },
        data: {
            ...(body.title && { title: body.title }),
            ...(body.date && { date: new Date(body.date) }),
        },
        include: {
            blocks: {
                include: {
                    studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                },
            },
        },
    })

    return NextResponse.json(updated)
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await props.params
    const sim = await getSimWithAuth(id, session.user)
    if (!sim) return new NextResponse("Não encontrado ou acesso negado", { status: 404 })

    await prisma.simulation.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
}
