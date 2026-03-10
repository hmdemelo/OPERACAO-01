import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import {
    getWeeklySummary,
    getDailyProgress,
    getSubjectDistribution,
    getStudyHistory,
} from "@/lib/metrics/studentMetrics"
import { DashboardContainer } from "@/components/student/DashboardContainer"

export default async function StudentDashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const userId = session.user.id

    // Fetch all necessary data largely in parallel for the dashboard
    const [weeklySummary, dailyProgress, subjectDistribution, historyData] = await Promise.all([
        getWeeklySummary(userId),
        getDailyProgress(userId),
        getSubjectDistribution(userId),
        getStudyHistory(userId, { period: 'all', limit: 100 }) // Fetch last 100 logs for history context
    ])

    return (
        <div className="container mx-auto p-6">
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
