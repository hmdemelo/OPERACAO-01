import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { isMasterAdmin } from "@/lib/auth/superAdmin"
import { logger } from "@/lib/logger"

export const maxDuration = 60

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Não autenticado", { status: 401 })
    }

    if (!isMasterAdmin(session.user)) {
        return new NextResponse("Apenas o admin master pode resetar usuários", { status: 403 })
    }

    try {
        const { id } = await params

        if (id === session.user.id) {
            return new NextResponse("Você não pode resetar sua própria conta", { status: 403 })
        }

        const target = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, role: true },
        })

        if (!target) {
            return new NextResponse("Usuário não encontrado", { status: 404 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const plans = await tx.weeklyPlan.deleteMany({ where: { userId: id } })
            const logs = await tx.studyLog.deleteMany({ where: { userId: id } })
            const subjects = await tx.userSubject.deleteMany({ where: { userId: id } })
            const concursos = await tx.userConcurso.deleteMany({ where: { userId: id } })
            const mentorship = await tx.mentorshipLink.deleteMany({ where: { studentId: id } })
            const questions = await tx.question.deleteMany({
                where: { uploadedById: id, status: { in: ["PENDING", "REJECTED"] } },
            })

            return {
                plans: plans.count,
                logs: logs.count,
                subjects: subjects.count,
                concursos: concursos.count,
                mentorship: mentorship.count,
                questions: questions.count,
            }
        }, { maxWait: 10000, timeout: 30000 })

        logger.info(`[USER_RESET] master=${session.user.email} target=${target.name} (${id})`, result)

        return NextResponse.json({
            ok: true,
            user: { id: target.id, name: target.name },
            deleted: result,
        })
    } catch (error) {
        logger.error("[USER_RESET]", error)
        return new NextResponse("Erro ao resetar usuário", { status: 500 })
    }
}
