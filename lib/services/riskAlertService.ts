import { prisma } from "@/lib/db"
import { subDays, startOfDay } from "date-fns"

export type RiskAlert = {
    studentId: string
    studentName: string
    reasons: string[]
    lastActiveDays: number
    accuracy: number
    completionRate: number
}

// Configurações Padrões da Plataforma de Risco
const RISK_THRESHOLDS = {
    MAX_DAYS_INACTIVE: 3,         // Mais de 3 dias sem logar/estudar = Risco
    MIN_ACCURACY_PERCENTAGE: 60,  // Menos de 60% = Risco
    MIN_COMPLETION_RATE: 50       // Menos de 50% = Risco 
}

export async function getStudentsAtRisk(mentorId?: string): Promise<RiskAlert[]> {
    const studentWhere: any = { role: "STUDENT", active: true }
    if (mentorId) {
        studentWhere.studentLink = { mentorId }
    }

    const students = await prisma.user.findMany({
        where: studentWhere,
        include: {
            logs: {
                orderBy: { date: 'desc' },
                take: 10
            },
            weeklyPlans: {
                orderBy: { startDate: 'desc' },
                take: 1, 
                include: {
                    items: true
                }
            }
        }
    })

    const today = startOfDay(new Date())
    const thresholdDate = subDays(today, RISK_THRESHOLDS.MAX_DAYS_INACTIVE)
    const alerts: RiskAlert[] = []

    for (const student of students) {
        const reasons: string[] = []

        // Inatividade
        const lastLog = student.logs[0]
        let inactiveRisk = false
        if (!lastLog || lastLog.date < thresholdDate) {
            inactiveRisk = true
            reasons.push(`Inativo há mais de ${RISK_THRESHOLDS.MAX_DAYS_INACTIVE} dias`)
        }

        // Precisão (Media das ultimas logs)
        let accRisk = false
        let overallAccuracy = 0
        if (student.logs.length > 0) {
            let totalQ = 0
            let correct = 0
            student.logs.forEach(l => {
                totalQ += l.questionsAnswered
                correct += l.correctAnswers
            })
            if (totalQ > 10) { 
                overallAccuracy = (correct / totalQ) * 100
                if (overallAccuracy < RISK_THRESHOLDS.MIN_ACCURACY_PERCENTAGE) {
                    accRisk = true
                    reasons.push(`Precisão crítica (${overallAccuracy.toFixed(1)}%)`)
                }
            }
        }

        // Planejamento
        let compRisk = false
        let completionRate = 0
        const currentPlan = student.weeklyPlans[0]
        if (currentPlan && currentPlan.items.length > 0) {
            const completed = currentPlan.items.filter(i => i.completed).length
            completionRate = (completed / currentPlan.items.length) * 100

            if (completionRate < RISK_THRESHOLDS.MIN_COMPLETION_RATE) {
                compRisk = true
                reasons.push(`Baixa adesão ao P.E (${completionRate.toFixed(1)}%)`)
            }
        }

        if (inactiveRisk || accRisk || compRisk) {
            alerts.push({
                studentId: student.id,
                studentName: student.name,
                reasons,
                lastActiveDays: lastLog ? Math.floor((new Date().getTime() - lastLog.date.getTime()) / (1000 * 3600 * 24)) : 999,
                accuracy: Math.round(overallAccuracy),
                completionRate: Math.round(completionRate)
            })
        }
    }

    return alerts
}
