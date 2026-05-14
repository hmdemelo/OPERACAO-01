import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db'
import { parseISO, isValid, addDays, endOfDay, subDays, format } from 'date-fns'
import { getAraguainaStartOfWeek } from '@/lib/date-utils'
import { getMentorIdFilter } from '@/lib/auth/superAdmin'
import { getWeeklySummary, getDailyProgress, getSubjectDistribution } from '@/lib/metrics/studentMetrics'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MENTOR'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    // Mentors can only access their own students
    const mentorId = getMentorIdFilter({ id: session.user.id, role: session.user.role, email: session.user.email })
    if (mentorId) {
        const link = await prisma.mentorshipLink.findFirst({ where: { mentorId, studentId: userId } })
        if (!link) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const rawPeriod = searchParams.get('period')
    const period: 'week' | 'month' | 'all' = rawPeriod === 'month' ? 'month' : rawPeriod === 'all' ? 'all' : 'week'
    const dateParam = searchParams.get('date')

    // For 'all': find first StudyLog date, no previous period
    if (period === 'all') {
        const firstLog = await prisma.studyLog.findFirst({
            where: { userId },
            orderBy: { date: 'asc' },
            select: { date: true },
        })

        const currentStart = firstLog?.date ?? new Date()
        const currentEnd = endOfDay(new Date())

        const [student, current, rawLogs, subjectBreakdown, planWeeks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    name: true,
                    email: true,
                    targetExam: true,
                    userConcursos: { include: { concurso: { select: { name: true } } } },
                },
            }),
            getWeeklySummary(userId, currentStart, currentEnd),
            prisma.studyLog.findMany({
                where: { userId, date: { gte: currentStart, lte: currentEnd } },
                select: { date: true, hoursStudied: true, questionsAnswered: true, correctAnswers: true },
                orderBy: { date: 'asc' },
            }),
            getSubjectDistribution(userId, currentStart, currentEnd),
            prisma.weeklyPlan.findMany({
                where: { userId },
                include: { items: { select: { completed: true } } },
                orderBy: { startDate: 'asc' },
            }),
        ])

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

        // Build a map of week start (yyyy-MM-dd) → adherence %
        const adherenceByWeek = new Map<string, number>()
        for (const plan of planWeeks) {
            const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(plan.startDate)
            const total = plan.items.length
            const done = plan.items.filter(i => i.completed).length
            adherenceByWeek.set(key, total > 0 ? Math.round((done / total) * 100) : 0)
        }

        // Group logs by week start (yyyy-MM-dd in Araguaina tz)
        const weekMap = new Map<string, { hours: number; questions: number; correct: number }>()
        for (const log of rawLogs) {
            const logDate = new Date(new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(log.date))
            const ws = getAraguainaStartOfWeek(logDate)
            const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(ws)
            if (!weekMap.has(key)) weekMap.set(key, { hours: 0, questions: 0, correct: 0 })
            const entry = weekMap.get(key)!
            entry.hours += log.hoursStudied
            entry.questions += log.questionsAnswered
            entry.correct += log.correctAnswers
        }
        const dailyProgress = Array.from(weekMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, s]) => ({
                date,
                hours: s.hours,
                questions: s.questions,
                correct: s.correct,
                accuracy: s.questions > 0 ? (s.correct / s.questions) * 100 : 0,
                adherence: adherenceByWeek.has(date) ? adherenceByWeek.get(date)! : null,
            }))

        const toAraguainaDateKey = (d: Date) =>
            new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(d)
        const activeDays = new Set(rawLogs.map(l => toAraguainaDateKey(l.date))).size
        const totalDays = Math.max(1, Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 3600 * 24)))

        const volumeScore = Math.min(current.totalQuestions / 100, 1) * 100
        const consistencyScore = Math.min(activeDays / totalDays, 1) * 100
        const performanceScore = Math.round(current.accuracy * 0.5 + volumeScore * 0.3 + consistencyScore * 0.2)

        const allPlanWeeks = planWeeks.map(plan => {
            const ws = plan.startDate
            const totalBlocks = plan.items.length
            const completedBlocks = plan.items.filter(i => i.completed).length
            return {
                label: `Semana de ${ws.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Araguaina' })}`,
                hasPlan: true,
                totalBlocks,
                completedBlocks,
                progressPercentage: totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0,
            }
        })
        const avgAdherence = allPlanWeeks.length > 0
            ? Math.round(allPlanWeeks.reduce((acc, w) => acc + w.progressPercentage, 0) / allPlanWeeks.length)
            : 0

        const recentLogs = rawLogs.slice(-10).reverse()
        const alerts: string[] = []
        const lastLog = recentLogs[0]
        const daysSinceActive = lastLog
            ? Math.floor((Date.now() - lastLog.date.getTime()) / (1000 * 3600 * 24))
            : 999
        if (daysSinceActive > 3) alerts.push(`Inativo há mais de 3 dias`)
        if (current.totalQuestions > 10 && current.accuracy < 60) alerts.push(`Precisão crítica (${current.accuracy.toFixed(1)}%)`)

        return NextResponse.json({
            student: {
                name: student.name,
                email: student.email,
                targetExam: student.targetExam,
                concursos: student.userConcursos.map(uc => uc.concurso.name),
            },
            period: { type: 'all', startDate: currentStart.toISOString(), endDate: currentEnd.toISOString() },
            current: { ...current, activeDays, performanceScore },
            previous: { totalHours: 0, totalQuestions: 0, accuracy: 0 },
            dailyProgress,
            subjectBreakdown,
            planAdherence: { weeks: allPlanWeeks, avgPercentage: avgAdherence },
            alerts,
        })
    }

    // Resolve reference date (anchor week start)
    const rawDate = dateParam && isValid(parseISO(dateParam)) ? dateParam : undefined
    const weekStart = getAraguainaStartOfWeek(rawDate ?? new Date())

    // Current period boundaries
    const currentStart = period === 'month' ? subDays(weekStart, 21) : weekStart
    const currentEnd = endOfDay(addDays(currentStart, period === 'month' ? 27 : 6))

    // Previous period (same duration, immediately before)
    const periodDays = period === 'month' ? 28 : 7
    const prevStart = subDays(currentStart, periodDays)
    const prevEnd = endOfDay(subDays(currentStart, 1))

    // Fetch all data in parallel
    const [student, current, previous, dailyProgress, subjectBreakdown, planWeeks] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                targetExam: true,
                userConcursos: { include: { concurso: { select: { name: true } } } },
            },
        }),
        getWeeklySummary(userId, currentStart, currentEnd),
        getWeeklySummary(userId, prevStart, prevEnd),
        getDailyProgress(userId, currentStart, currentEnd),
        getSubjectDistribution(userId, currentStart, currentEnd),
        // Fetch weekly plan adherence for each week in the period
        (async () => {
            const weeks: Date[] = []
            const numWeeks = period === 'month' ? 4 : 1
            for (let i = 0; i < numWeeks; i++) {
                weeks.push(addDays(currentStart, i * 7))
            }

            return Promise.all(weeks.map(async (ws) => {
                const plan = await prisma.weeklyPlan.findUnique({
                    where: { userId_startDate: { userId, startDate: getAraguainaStartOfWeek(ws) } },
                    include: { items: { select: { completed: true } } },
                })
                const totalBlocks = plan?.items.length ?? 0
                const completedBlocks = plan?.items.filter(i => i.completed).length ?? 0
                return {
                    label: `Semana de ${ws.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Araguaina' })}`,
                    hasPlan: !!plan,
                    totalBlocks,
                    completedBlocks,
                    progressPercentage: totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0,
                }
            }))
        })(),
    ])

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const toAraguainaDateKey = (d: Date) =>
        new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(d)

    // Active days in current period
    const [activeDaysResult, prevActiveDaysResult] = await Promise.all([
        prisma.studyLog.findMany({
            where: { userId, date: { gte: currentStart, lte: currentEnd } },
            select: { date: true },
        }),
        prisma.studyLog.findMany({
            where: { userId, date: { gte: prevStart, lte: prevEnd } },
            select: { date: true },
        }),
    ])
    const activeDays = new Set(activeDaysResult.map(l => toAraguainaDateKey(l.date))).size
    const prevActiveDays = new Set(prevActiveDaysResult.map(l => toAraguainaDateKey(l.date))).size

    // Performance score: 50% accuracy + 30% volume (capped at 100 questions = max) + 20% consistency
    const maxQuestions = 100
    const volumeScore = Math.min(current.totalQuestions / maxQuestions, 1) * 100
    const consistencyScore = Math.min(activeDays / periodDays, 1) * 100
    const performanceScore = Math.round(
        current.accuracy * 0.5 + volumeScore * 0.3 + consistencyScore * 0.2
    )

    const prevVolumeScore = Math.min(previous.totalQuestions / maxQuestions, 1) * 100
    const prevConsistencyScore = Math.min(prevActiveDays / periodDays, 1) * 100
    const prevPerformanceScore = Math.round(
        previous.accuracy * 0.5 + prevVolumeScore * 0.3 + prevConsistencyScore * 0.2
    )

    // Risk alerts for this student
    const recentLogs = await prisma.studyLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10,
    })
    const alerts: string[] = []
    const lastLog = recentLogs[0]
    const daysSinceActive = lastLog
        ? Math.floor((Date.now() - lastLog.date.getTime()) / (1000 * 3600 * 24))
        : 999
    if (daysSinceActive > 3) alerts.push(`Inativo há mais de 3 dias`)
    if (current.totalQuestions > 10 && current.accuracy < 60) {
        alerts.push(`Precisão crítica (${current.accuracy.toFixed(1)}%)`)
    }
    const latestPlan = planWeeks[planWeeks.length - 1]
    if (latestPlan.totalBlocks > 0 && latestPlan.progressPercentage < 50) {
        alerts.push(`Baixa adesão ao P.E (${latestPlan.progressPercentage}%)`)
    }

    const weeksWithPlan = planWeeks.filter(w => w.hasPlan)
    const avgAdherence = weeksWithPlan.length > 0
        ? Math.round(weeksWithPlan.reduce((acc, w) => acc + w.progressPercentage, 0) / weeksWithPlan.length)
        : 0

    return NextResponse.json({
        student: {
            name: student.name,
            email: student.email,
            targetExam: student.targetExam,
            concursos: student.userConcursos.map(uc => uc.concurso.name),
        },
        period: {
            type: period,
            startDate: currentStart.toISOString(),
            endDate: currentEnd.toISOString(),
        },
        current: { ...current, activeDays, performanceScore },
        previous: { ...previous, activeDays: prevActiveDays, performanceScore: prevPerformanceScore },
        dailyProgress,
        subjectBreakdown,
        planAdherence: {
            weeks: planWeeks,
            avgPercentage: avgAdherence,
        },
        alerts,
    })
}
