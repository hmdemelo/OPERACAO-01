import { prisma } from "@/lib/db"
import { startOfDay, subDays, endOfDay, startOfWeek, format } from "date-fns"
import { getAraguainaStartOfWeek } from "@/lib/date-utils"

export async function getWeeklySummary(userId: string, startDate?: Date, endDate?: Date) {
    const resolvedEnd = endDate ?? endOfDay(new Date())
    const resolvedStart = startDate ?? getAraguainaStartOfWeek(new Date())

    const aggregations = await prisma.studyLog.aggregate({
        where: {
            userId,
            date: {
                gte: resolvedStart,
                lte: resolvedEnd,
            },
        },
        _sum: {
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
        },
        _count: {
            id: true,
        },
    })

    const totalHours = aggregations._sum.hoursStudied || 0
    const totalQuestions = aggregations._sum.questionsAnswered || 0
    const totalCorrect = aggregations._sum.correctAnswers || 0
    const accuracy =
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    return {
        totalHours,
        totalQuestions,
        totalCorrect,
        accuracy: parseFloat(accuracy.toFixed(2)),
        logCount: aggregations._count.id,
    }
}

export async function getDailyProgress(userId: string, startDate?: Date, endDate?: Date) {
    const resolvedEnd = endDate ?? endOfDay(new Date())
    const resolvedStart = startDate ?? getAraguainaStartOfWeek(new Date())

    const rawLogs = await prisma.studyLog.findMany({
        where: {
            userId,
            date: {
                gte: resolvedStart,
                lte: resolvedEnd,
            },
        },
        select: {
            date: true,
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
        },
        orderBy: { date: "asc" },
    })

    const dailyMap = new Map<string, {
        hours: number
        questions: number
        correct: number
    }>()

    for (const log of rawLogs) {
        // Use Araguaina timezone (UTC-3) to group by local date, not UTC
        const dateKey = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Araguaina' }).format(log.date)

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { hours: 0, questions: 0, correct: 0 })
        }

        const entry = dailyMap.get(dateKey)!
        entry.hours += log.hoursStudied
        entry.questions += log.questionsAnswered
        entry.correct += log.correctAnswers
    }

    return Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
            date,
            hours: stats.hours,
            questions: stats.questions,
            correct: stats.correct,
            accuracy: stats.questions > 0 ? (stats.correct / stats.questions) * 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getSubjectDistribution(userId: string, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate || endDate ? {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
    } : undefined

    const subjectStats = await prisma.studyLog.groupBy({
        by: ["subjectId"],
        where: {
            userId,
            ...(dateFilter && { date: dateFilter }),
        },
        _sum: {
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
        },
    })

    // We need to fetch subject names because groupBy only gives us IDs
    const subjectIds = subjectStats.map(s => s.subjectId)
    const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true }
    })

    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    return subjectStats.map((stat) => ({
        subject: subjectMap.get(stat.subjectId) || "Unknown",
        totalHours: stat._sum.hoursStudied || 0,
        totalQuestions: stat._sum.questionsAnswered || 0,
        accuracy:
            (stat._sum.questionsAnswered || 0) > 0
                ? ((stat._sum.correctAnswers || 0) / (stat._sum.questionsAnswered || 0)) *
                100
                : 0,
    })).sort((a, b) => b.totalHours - a.totalHours)
}

// ... existing code ...


export async function getStudyHistory(
    userId: string,
    filters?: {
        period?: 'week' | 'fortnight' | 'all'
        subject?: string
        startDate?: Date
        endDate?: Date
        page?: number
        limit?: number
    }
) {
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const where: any = { userId }
    const period = filters?.period || 'week'

    // Period Filter Logic
    const today = endOfDay(new Date())
    let rangeStart: Date

    if (period === 'all') {
        rangeStart = new Date(0) // No restriction
    } else if (period === 'fortnight') {
        rangeStart = startOfDay(subDays(today, 15))
    } else {
        // Default: Week
        rangeStart = getAraguainaStartOfWeek(today)
    }

    // Apply date range
    if (!where.date) where.date = {}
    where.date.gte = rangeStart
    where.date.lte = today

    if (filters?.subject) {
        where.subject = { name: { contains: filters.subject, mode: "insensitive" } }
    }

    if (filters?.startDate || filters?.endDate) {
        // Specific dates override period if provided (though UI implies period selection)
        if (filters.startDate) where.date.gte = filters.startDate
        if (filters.endDate) where.date.lte = filters.endDate
    }

    const [logs, total] = await prisma.$transaction([
        prisma.studyLog.findMany({
            where,
            orderBy: { date: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                date: true,
                subject: { select: { name: true } },
                content: { select: { name: true } },
                topic: true,
                hoursStudied: true,
                questionsAnswered: true,
                correctAnswers: true,
            },
        }),
        prisma.studyLog.count({ where }),
    ])

    const mappedLogs = (logs as any[]).map((log) => {
        const subjectName = log.subject ? log.subject.name : "Unknown"
        const contentName = log.content ? log.content.name : log.topic
        const formattedDate = format(new Date(log.date), "dd/MM/yyyy") // Changed format as requested

        return {
            id: log.id,
            date: formattedDate,
            subject: subjectName,
            topic: contentName || "-",
            hoursStudied: log.hoursStudied,
            questionsAnswered: log.questionsAnswered,
            correctAnswers: log.correctAnswers,
            accuracy:
                log.questionsAnswered > 0
                    ? (log.correctAnswers / log.questionsAnswered) * 100
                    : 0,
        }
    })

    return {
        data: mappedLogs,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}
