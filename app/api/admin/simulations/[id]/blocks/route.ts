import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

const addSchema = z.object({ studyBlockId: z.string().min(1) })

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await props.params
    const sim = await prisma.simulation.findUnique({
        where: { id },
        include: { grid: { select: { userId: true } } },
    })
    if (!sim || !(await canManageStudentGrade(session.user, sim.grid.userId))) {
        return new NextResponse("Não encontrado ou acesso negado", { status: 404 })
    }

    const { studyBlockId } = addSchema.parse(await req.json())
    const block = await prisma.simulationBlock.create({
        data: { simulationId: id, studyBlockId },
        include: { studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } } },
    })

    return NextResponse.json(block)
}
