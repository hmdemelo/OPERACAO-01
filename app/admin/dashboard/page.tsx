import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import {
    getCachedDashboardSummary,
    getCachedSubjectDistributionAll,
    getCachedWeeklyEvolution,
    getCachedScheduleAdherence
} from "@/lib/metrics/cachedAdminMetrics"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DashboardStudentRow } from "@/components/admin/dashboard/DashboardStudentRow"
import { DashboardKpiCards } from "@/components/admin/dashboard/DashboardKpiCards"
import { DashboardAlertPanel } from "@/components/admin/dashboard/DashboardAlertPanel"
import { DashboardSubjectChart } from "@/components/admin/dashboard/DashboardSubjectChart"
import { DashboardEvolutionChart } from "@/components/admin/dashboard/DashboardEvolutionChart"
import { DashboardScheduleAdherence } from "@/components/admin/dashboard/DashboardScheduleAdherence"
import Link from "next/link"
import { ArrowUpDown } from "lucide-react"
import { DashboardPagination } from "@/components/admin/dashboard/DashboardPagination"
import { DashboardSyncButton } from "@/components/admin/dashboard/DashboardSyncButton"


export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string; order?: string; page?: string; limit?: string; period?: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    if (!["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/student/dashboard")
    }

    // Await searchParams for Next.js 15+ compatibility
    const params = await searchParams
    const sort = params?.sort || 'rank'
    const order = params?.order === 'desc' ? 'desc' : 'asc'
    const page = Number(params?.page) || 1
    const limit = Number(params?.limit) || 10
    const period = (params?.period as 'week' | 'fortnight' | 'all') || 'week'

    // Mentors only see their own students
    const userRole = session.user.role as string
    const mentorId = userRole === "MENTOR" ? session.user.id : undefined
    const [summary, subjectDistribution, weeklyEvolution, scheduleAdherence] = await Promise.all([
        getCachedDashboardSummary(period, mentorId),
        getCachedSubjectDistributionAll(period, mentorId),
        getCachedWeeklyEvolution(mentorId),
        getCachedScheduleAdherence(mentorId),
    ])
    const dashboardTitle = userRole === "MENTOR" ? "Meus Alunos" : "Visão Geral Admin"

    // Sorting Logic
    const sortedData = [...summary.students].sort((a, b) => {
        let comparison = 0
        if (sort === 'aluno') comparison = a.name.localeCompare(b.name)
        else if (sort === 'accuracy') comparison = a.accuracy - b.accuracy
        else if (sort === 'questions') comparison = a.totalQuestions - b.totalQuestions
        else if (sort === 'hours') comparison = a.totalHours - b.totalHours
        // Default rank order (descending score usually means rank 1)
        else comparison = b.performanceScore - a.performanceScore

        return order === 'asc' ? comparison : -comparison
    })

    // Pagination Logic
    const offset = (page - 1) * limit
    const performanceData = sortedData.slice(offset, offset + limit)
    const totalPages = Math.ceil(summary.students.length / limit)

    const getSortLink = (col: string) => ({
        query: {
            sort: col,
            order: sort === col && order === 'asc' ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
            period // Maintain current period filter
        }
    })

    const getPeriodLink = (p: string) => ({
        query: {
            period: p,
            sort,
            order,
            page: "1",
            limit: limit.toString()
        }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header with Title + Period Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">{dashboardTitle}</h1>
                    <DashboardSyncButton />
                </div>
                <div className="flex bg-muted rounded-lg p-1">
                    <Link href={getPeriodLink('week')} prefetch={false} className={`px-4 py-1.5 text-sm rounded-md transition-all ${period === 'week' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>Semana</Link>
                    <Link href={getPeriodLink('fortnight')} prefetch={false} className={`px-4 py-1.5 text-sm rounded-md transition-all ${period === 'fortnight' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>Quinzena</Link>
                    <Link href={getPeriodLink('all')} prefetch={false} className={`px-4 py-1.5 text-sm rounded-md transition-all ${period === 'all' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>Geral</Link>
                </div>
            </div>

            {/* KPI Cards */}
            <DashboardKpiCards
                totalStudents={summary.totalStudents}
                avgAccuracy={summary.avgAccuracy}
                totalHours={summary.totalHours}
                engagementRate={summary.engagementRate}
                totalQuestions={summary.totalQuestions}
                activeStudents={summary.activeStudents}
            />

            {/* Alert Panel */}
            <DashboardAlertPanel
                zeroActivity={summary.alerts.zeroActivity}
                lowAccuracy={summary.alerts.lowAccuracy}
                lowActivity={summary.alerts.lowActivity}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSubjectChart data={subjectDistribution} />
                <DashboardEvolutionChart data={weeklyEvolution} />
            </div>

            {/* Schedule Adherence */}
            <DashboardScheduleAdherence
                students={scheduleAdherence.students}
                avgAdherence={scheduleAdherence.avgAdherence}
                withPlan={scheduleAdherence.withPlan}
                withoutPlan={scheduleAdherence.withoutPlan}
                completed={scheduleAdherence.completed}
            />

            {/* Performance Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">
                                <Link href={getSortLink('rank')} prefetch={false} className="flex items-center gap-1 hover:text-foreground">
                                    Rank <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead>
                                <Link href={getSortLink('aluno')} prefetch={false} className="flex items-center gap-1 hover:text-foreground">
                                    Aluno <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="text-right">
                                <Link href={getSortLink('accuracy')} prefetch={false} className="flex items-center gap-1 justify-end hover:text-foreground">
                                    Precisão <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="text-right">
                                <Link href={getSortLink('questions')} prefetch={false} className="flex items-center gap-1 justify-end hover:text-foreground">
                                    Questões <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="text-right">
                                <Link href={getSortLink('hours')} prefetch={false} className="flex items-center gap-1 justify-end hover:text-foreground">
                                    Horas <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="text-center w-[150px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {performanceData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Nenhum dado de aluno disponível.
                                </TableCell>
                            </TableRow>
                        ) : (
                            performanceData.map((student, index) => (
                                <DashboardStudentRow
                                    key={student.id}
                                    rank={offset + index + 1}
                                    user={{
                                        id: student.id,
                                        name: student.name,
                                        email: null
                                    }}
                                    stats={{
                                        accuracy: student.accuracy,
                                        questions: student.totalQuestions,
                                        hours: student.totalHours
                                    }}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DashboardPagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={limit}
                totalItems={summary.students.length}
            />
        </div>
    )
}
