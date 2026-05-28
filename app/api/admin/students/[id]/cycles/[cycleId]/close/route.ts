import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"

// PATCH /api/admin/students/[id]/cycles/[cycleId]/close
// Encerra manualmente o ciclo ativo do aluno (sem criar próximo).
export async function PATCH(
    _req: Request,
    props: { params: Promise<{ id: string; cycleId: string }> },
) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    const { id: studentId, cycleId } = await props.params
    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const cycle = await prisma.studyGrid.findUnique({
        where: { id: cycleId },
        select: { userId: true, active: true },
    })
    if (!cycle || cycle.userId !== studentId) {
        return new NextResponse("Ciclo não encontrado", { status: 404 })
    }
    if (!cycle.active) {
        return new NextResponse("Ciclo já está encerrado", { status: 400 })
    }

    const updated = await prisma.studyGrid.update({
        where: { id: cycleId },
        data: { active: false, completedAt: new Date() },
        select: { id: true, completedAt: true },
    })

    return NextResponse.json(updated)
}
