import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import {
    getWeeklySummary,
    getDailyProgress,
    getSubjectDistribution,
    getStudyHistory,
} from "@/lib/metrics/studentMetrics"
import { logger } from "@/lib/logger"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch all necessary data largely in parallel
        const [weeklySummary, dailyProgress, subjectDistribution, historyData] = await Promise.all([
            getWeeklySummary(userId),
            getDailyProgress(userId),
            getSubjectDistribution(userId),
            getStudyHistory(userId, { period: 'all', limit: 100 })
        ])

        return NextResponse.json({
            weeklySummary,
            dailyProgress,
            subjectDistribution,
            fullHistory: historyData.data
        })
    } catch (error) {
        logger.error("Error fetching student dashboard API:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
}
