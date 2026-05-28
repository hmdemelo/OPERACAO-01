import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

// Portabilidade de dados (LGPD art. 18, V): exporta todos os dados do titular
// em JSON estruturado. Nunca expõe passwordHash nem dados de terceiros.
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return new NextResponse("Não autenticado", { status: 401 })
    }

    try {
        const userId = session.user.id

        const [
            user,
            logs,
            studyLogHistory,
            weeklyPlans,
            studyGrid,
            questionAnswers,
            userSubjects,
            userConcursos,
            uploadedQuestions,
            simulations,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    birthDate: true,
                    targetExam: true,
                    addressCity: true,
                    addressState: true,
                    educationLevel: true,
                    dailyHours: true,
                    showAnsweredQuestions: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.studyLog.findMany({
                where: { userId },
                orderBy: { date: "desc" },
            }),
            prisma.studyLogHistory.findMany({
                where: { studyLog: { userId } },
                orderBy: { changedAt: "desc" },
            }),
            prisma.weeklyPlan.findMany({
                where: { userId },
                include: { items: true },
                orderBy: { startDate: "desc" },
            }),
            prisma.studyGrid.findMany({
                where: { userId },
                orderBy: { cycleNumber: "asc" },
                include: {
                    blocks: {
                        include: {
                            contentBlocks: {
                                include: { topicBlocks: true },
                            },
                        },
                    },
                },
            }),
            prisma.questionAnswer.findMany({
                where: { userId },
                orderBy: { answeredAt: "desc" },
            }),
            prisma.userSubject.findMany({
                where: { userId },
                include: { subject: { select: { id: true, name: true } } },
            }),
            prisma.userConcurso.findMany({
                where: { userId },
                include: { concurso: { select: { id: true, name: true } } },
            }),
            prisma.question.findMany({
                where: { uploadedById: userId },
                select: { id: true, stem: true, status: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            }),
            prisma.simulation.findMany({
                where: { grid: { userId } },
                include: { blocks: true },
                orderBy: { date: "desc" },
            }),
        ])

        if (!user) {
            return new NextResponse("Usuário não encontrado", { status: 404 })
        }

        const payload = {
            exportadoEm: new Date().toISOString(),
            versaoFormato: "1.0",
            avisoLGPD:
                "Este arquivo contém todos os dados pessoais associados à sua conta na Operação 01, em conformidade com o art. 18, V da LGPD (direito à portabilidade).",
            perfil: user,
            logsDeEstudo: logs,
            historicoDeLogs: studyLogHistory,
            planoSemanal: weeklyPlans,
            gradeDeEstudos: studyGrid,
            respostasDeQuestoes: questionAnswers,
            disciplinasVinculadas: userSubjects,
            concursosVinculados: userConcursos,
            questoesEnviadas: uploadedQuestions,
            simulados: simulations,
        }

        logger.info("[USER_EXPORT]", { userId, timestamp: payload.exportadoEm })

        const filename = `operacao01-meus-dados-${new Date().toISOString().slice(0, 10)}.json`

        return new NextResponse(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        })
    } catch (error) {
        logger.error("[USER_EXPORT]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
