import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek, subDays, subWeeks, startOfDay, endOfDay, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type StudentPerformance = {
    id: string
    name: string
    totalHours: number
    totalQuestions: number
    totalCorrect: number
    accuracy: number
    consistency: number // days active in last 7 days
    performanceScore: number
    alerts: {
        lowAccuracy: boolean
        lowActivity: boolean
        zeroHours: boolean
    }
}

// --- REPLACED: Updated to support period argument ---
export type PeriodType = 'week' | 'fortnight' | 'all'

export async function getStudentPerformance(period: PeriodType = 'week', mentorId?: string): Promise<StudentPerformance[]> {
    const endDate = endOfDay(new Date())
    let startDate: Date

    if (period === 'fortnight') {
        startDate = startOfDay(subDays(endDate, 15))
    } else if (period === 'all') {
        startDate = new Date(0) // 1970-01-01
    } else {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
    }

    // 1. Fetch students (filtered by mentor if provided)
    const studentWhere: any = { role: "STUDENT", active: true }
    if (mentorId) {
        studentWhere.studentLink = { mentorId }
    }

    const students = await prisma.user.findMany({
        where: studentWhere,
        select: { id: true, name: true, email: true },
    })

    // 2. Fetch Aggregates
    const stats = await prisma.studyLog.groupBy({
        by: ["userId"],
        where: {
            date: { gte: startDate, lte: endDate },
        },
        _sum: {
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
        },
    })

    // 3. Fetch logs for unique active days count
    const logs = await prisma.studyLog.findMany({
        where: {
            date: { gte: startDate, lte: endDate },
        },
        select: { userId: true, date: true },
    })

    const uniqueDaysMap = new Map<string, Set<string>>()
    logs.forEach(log => {
        const dateStr = log.date.toISOString().split('T')[0]
        if (!uniqueDaysMap.has(log.userId)) {
            uniqueDaysMap.set(log.userId, new Set())
        }
        uniqueDaysMap.get(log.userId)?.add(dateStr)
    })


    // Process data
    const performanceData: StudentPerformance[] = students.map((student) => {
        const studentStats = stats.find((s) => s.userId === student.id)

        // Consistency
        const activeDays = uniqueDaysMap.get(student.id)?.size || 0

        const totalHours = studentStats?._sum.hoursStudied || 0
        const totalQuestions = studentStats?._sum.questionsAnswered || 0
        const totalCorrect = studentStats?._sum.correctAnswers || 0
        const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

        // Ensure name is not null
        const displayName = student.name || student.email || "Unknown"

        // Scale scores
        const accScore = accuracy // 0-100
        const volScore = Math.min(totalQuestions / 100, 10) * 10 // 100 questions = 100 pts
        // For consistency score, we can arguably keep it simple: 
        // If Period is 'all', consistency is harder to gauge as percentage. 
        // Let's cap consistency score to 100 if active days >= 5 regardless of period for now to avoid complexity,
        // or just accept that 'all time' users will have high consistency scores.
        const conScore = Math.min(activeDays / 5, 1) * 100

        // Weighted
        const performanceScore = (accScore * 0.5) + (volScore * 0.3) + (conScore * 0.2)

        return {
            id: student.id,
            name: displayName,
            totalHours,
            totalQuestions,
            totalCorrect,
            accuracy,
            consistency: activeDays,
            performanceScore: Number(performanceScore.toFixed(1)),
            alerts: {
                lowAccuracy: accuracy < 60 && totalQuestions > 10,
                lowActivity: totalQuestions < 10,
                zeroHours: totalHours === 0,
            }
        }
    })

    return performanceData.sort((a, b) => b.performanceScore - a.performanceScore)
}

// --- Dashboard Summary (aggregates from StudentPerformance) ---

export type DashboardSummary = {
    totalStudents: number
    activeStudents: number
    avgAccuracy: number
    totalHours: number
    totalQuestions: number
    engagementRate: number
    students: StudentPerformance[]
    alerts: {
        zeroActivity: StudentPerformance[]
        lowAccuracy: StudentPerformance[]
        lowActivity: StudentPerformance[]
    }
}

export async function getDashboardSummary(
    period: PeriodType = 'week',
    mentorId?: string
): Promise<DashboardSummary> {
    const students = await getStudentPerformance(period, mentorId)

    const totalStudents = students.length
    const activeStudents = students.filter(s => s.totalQuestions > 0 || s.totalHours > 0).length

    const totalHours = students.reduce((sum, s) => sum + s.totalHours, 0)
    const totalQuestions = students.reduce((sum, s) => sum + s.totalQuestions, 0)
    const totalCorrect = students.reduce((sum, s) => sum + s.totalCorrect, 0)

    const avgAccuracy = totalQuestions > 0
        ? (totalCorrect / totalQuestions) * 100
        : 0

    const engagementRate = totalStudents > 0
        ? (activeStudents / totalStudents) * 100
        : 0

    return {
        totalStudents,
        activeStudents,
        avgAccuracy: Number(avgAccuracy.toFixed(1)),
        totalHours: Number(totalHours.toFixed(1)),
        totalQuestions,
        engagementRate: Number(engagementRate.toFixed(0)),
        students,
        alerts: {
            zeroActivity: students.filter(s => s.alerts.zeroHours && s.totalQuestions === 0),
            lowAccuracy: students.filter(s => s.alerts.lowAccuracy),
            lowActivity: students.filter(s => s.alerts.lowActivity && !s.alerts.zeroHours),
        },
    }
}

// --- Chart Data: Subject Distribution (aggregated across students) ---

export type SubjectDistributionItem = {
    subject: string
    totalHours: number
    totalQuestions: number
    accuracy: number
}

export async function getSubjectDistributionAll(
    period: PeriodType = 'week',
    mentorId?: string
): Promise<SubjectDistributionItem[]> {
    const endDate = endOfDay(new Date())
    let startDate: Date

    if (period === 'fortnight') {
        startDate = startOfDay(subDays(endDate, 15))
    } else if (period === 'all') {
        startDate = new Date(0)
    } else {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
    }

    // Filter by mentor's students if needed
    const userFilter: any = {}
    if (mentorId) {
        const studentIds = await prisma.mentorshipLink.findMany({
            where: { mentorId },
            select: { studentId: true },
        })
        userFilter.userId = { in: studentIds.map(s => s.studentId) }
    }

    const stats = await prisma.studyLog.groupBy({
        by: ["subjectId"],
        where: {
            date: { gte: startDate, lte: endDate },
            ...userFilter,
        },
        _sum: {
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
        },
    })

    const subjectIds = stats.map(s => s.subjectId)
    const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true },
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    return stats
        .map(stat => ({
            subject: subjectMap.get(stat.subjectId) || "Desconhecida",
            totalHours: Number((stat._sum.hoursStudied || 0).toFixed(1)),
            totalQuestions: stat._sum.questionsAnswered || 0,
            accuracy: (stat._sum.questionsAnswered || 0) > 0
                ? Number((((stat._sum.correctAnswers || 0) / (stat._sum.questionsAnswered || 0)) * 100).toFixed(1))
                : 0,
        }))
        .sort((a, b) => b.totalHours - a.totalHours)
}

// --- Chart Data: Weekly Evolution (last 4 weeks) ---

export type WeeklyEvolutionItem = {
    week: string
    avgAccuracy: number
    totalQuestions: number
    totalHours: number
}

export async function getWeeklyEvolution(
    mentorId?: string
): Promise<WeeklyEvolutionItem[]> {
    const now = new Date()
    const weeks: WeeklyEvolutionItem[] = []

    // Filter by mentor's students if needed
    const userFilter: any = {}
    if (mentorId) {
        const studentIds = await prisma.mentorshipLink.findMany({
            where: { mentorId },
            select: { studentId: true },
        })
        userFilter.userId = { in: studentIds.map(s => s.studentId) }
    }

    for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
        const weekEnd = endOfDay(i === 0 ? now : endOfWeek(subWeeks(now, i), { weekStartsOn: 1 }))

        const agg = await prisma.studyLog.aggregate({
            where: {
                date: { gte: weekStart, lte: weekEnd },
                ...userFilter,
            },
            _sum: {
                hoursStudied: true,
                questionsAnswered: true,
                correctAnswers: true,
            },
        })

        const totalQ = agg._sum.questionsAnswered || 0
        const totalC = agg._sum.correctAnswers || 0

        weeks.push({
            week: format(weekStart, "dd/MM", { locale: ptBR }),
            avgAccuracy: totalQ > 0 ? Number(((totalC / totalQ) * 100).toFixed(1)) : 0,
            totalQuestions: totalQ,
            totalHours: Number((agg._sum.hoursStudied || 0).toFixed(1)),
        })
    }

    return weeks
}

// --- Chart Data: Schedule Adherence ---

export type StudentAdherence = {
    id: string
    name: string
    hasPlan: boolean
    totalBlocks: number
    completedBlocks: number
    progressPercentage: number
    status: "COMPLETED" | "IN_PROGRESS" | "PENDING"
}

export type ScheduleAdherenceSummary = {
    students: StudentAdherence[]
    avgAdherence: number
    withPlan: number
    withoutPlan: number
    completed: number
}

export async function getScheduleAdherence(
    mentorId?: string
): Promise<ScheduleAdherenceSummary> {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })

    const studentWhere: any = { role: "STUDENT", active: true }
    if (mentorId) {
        studentWhere.studentLink = { mentorId }
    }

    const students = await prisma.user.findMany({
        where: studentWhere,
        select: {
            id: true,
            name: true,
            weeklyPlans: {
                where: { startDate: weekStart },
                include: {
                    items: {
                        select: { completed: true },
                    },
                },
                take: 1,
            },
        },
        orderBy: { name: "asc" },
    })

    const mapped: StudentAdherence[] = students.map((student: any) => {
        const plan = student.weeklyPlans?.[0]

        if (!plan) {
            return {
                id: student.id,
                name: student.name || "Unknown",
                hasPlan: false,
                totalBlocks: 0,
                completedBlocks: 0,
                progressPercentage: 0,
                status: "PENDING" as const,
            }
        }

        const totalBlocks = plan.items.length
        const completedBlocks = plan.items.filter((i: any) => i.completed).length
        const progressPercentage = totalBlocks > 0
            ? Math.round((completedBlocks / totalBlocks) * 100)
            : 0

        let status: "COMPLETED" | "IN_PROGRESS" | "PENDING" = "IN_PROGRESS"
        if (totalBlocks > 0 && progressPercentage === 100) {
            status = "COMPLETED"
        } else if (totalBlocks === 0) {
            status = "IN_PROGRESS"
        }

        return {
            id: student.id,
            name: student.name || "Unknown",
            hasPlan: true,
            totalBlocks,
            completedBlocks,
            progressPercentage,
            status,
        }
    })

    const withPlan = mapped.filter(s => s.hasPlan)
    const avgAdherence = withPlan.length > 0
        ? Math.round(withPlan.reduce((sum, s) => sum + s.progressPercentage, 0) / withPlan.length)
        : 0

    // Sort: in progress (by % desc) first, then completed, then pending
    const sorted = mapped.sort((a, b) => {
        if (a.hasPlan && !b.hasPlan) return -1
        if (!a.hasPlan && b.hasPlan) return 1
        return b.progressPercentage - a.progressPercentage
    })

    return {
        students: sorted,
        avgAdherence,
        withPlan: withPlan.length,
        withoutPlan: mapped.length - withPlan.length,
        completed: mapped.filter(s => s.status === "COMPLETED").length,
    }
}

