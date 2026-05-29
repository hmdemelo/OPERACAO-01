import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import {
    getWeeklySummary,
    getDailyProgress,
    getSubjectDistribution,
    getStudyHistory,
} from "@/lib/metrics/studentMetrics"

import { DashboardContainer } from "@/components/student/DashboardContainer"
import { MotivationBanner } from "@/components/student/MotivationBanner"

export default async function StudentDashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const userId = session.user.id

    // Alunos V2 não têm dashboard — métricas dependem de StudyLog (V1).
    // Redireciona para a Fase 1, primeira tela útil no fluxo V2.
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { appVersion: true },
    })
    if (user?.appVersion === "v2") {
        redirect("/student/fase1")
    }

    // Fetch all necessary data largely in parallel for the dashboard
    const [weeklySummary, dailyProgress, subjectDistribution, historyData] = await Promise.all([
        getWeeklySummary(userId),
        getDailyProgress(userId),
        getSubjectDistribution(userId),
        getStudyHistory(userId, { period: 'all', limit: 100 })
    ])

    return (
        <div className="container mx-auto p-6 space-y-6">
            <MotivationBanner />
            <DashboardContainer
                initialData={{
                    weeklySummary,
                    dailyProgress,
                    subjectDistribution,
                    fullHistory: historyData.data
                }}
            />
        </div>
    )
}
