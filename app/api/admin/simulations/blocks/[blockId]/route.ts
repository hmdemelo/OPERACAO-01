import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const patchSchema = z.object({
    instructions: z.string().max(5000).nullable().optional(),
})

export async function PATCH(req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { blockId } = await props.params
    const sb = await prisma.simulationBlock.findUnique({
        where: { id: blockId },
        include: { simulation: { include: { grid: { select: { userId: true } } } } },
    })
    if (!sb || !(await canManageStudentGrade(session.user, sb.simulation.grid.userId))) {
        return new NextResponse("Não encontrado ou acesso negado", { status: 404 })
    }

    const body = patchSchema.parse(await req.json())
    const updated = await prisma.simulationBlock.update({
        where: { id: blockId },
        data: body,
    })

    return NextResponse.json(updated)
}

export async function DELETE(_req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { blockId } = await props.params
    const sb = await prisma.simulationBlock.findUnique({
        where: { id: blockId },
        include: { simulation: { include: { grid: { select: { userId: true } } } } },
    })
    if (!sb || !(await canManageStudentGrade(session.user, sb.simulation.grid.userId))) {
        return new NextResponse("Não encontrado ou acesso negado", { status: 404 })
    }

    await prisma.simulationBlock.delete({ where: { id: blockId } })
    return new NextResponse(null, { status: 204 })
}
