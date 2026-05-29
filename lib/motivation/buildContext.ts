import { prisma } from "@/lib/db"
import { getAraguainaStartOfWeek } from "@/lib/date-utils"
import type { V1MotivationContext, V2MotivationContext } from "./messages"

const TIMEZONE = "America/Araguaina"

/** Chave yyyy-mm-dd de uma data no fuso de Araguaína (mesma convenção dos metrics). */
function araguainaDateKey(date: Date): string {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: TIMEZONE }).format(date)
}

/** Dia da semana (0=Dom..6=Sáb) de uma data no fuso de Araguaína. */
function araguainaWeekday(date: Date): number {
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, weekday: "short" }).format(date)
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday)
}

function daysBetweenKeys(fromKey: string, toKey: string): number {
    const from = new Date(`${fromKey}T00:00:00Z`).getTime()
    const to = new Date(`${toKey}T00:00:00Z`).getTime()
    return Math.round((to - from) / 86_400_000)
}

export async function buildV1Context(userId: string): Promise<V1MotivationContext> {
    const now = new Date()
    const todayKey = araguainaDateKey(now)
    const weekStart = getAraguainaStartOfWeek(now)

    const [user, logs, weekAgg, allTimeAgg, plan] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
        // Datas dos StudyLog para streak/comeback (todas; agrupadas por dia local).
        prisma.studyLog.findMany({
            where: { userId },
            select: { date: true },
            orderBy: { date: "desc" },
        }),
        prisma.studyLog.aggregate({
            where: { userId, date: { gte: weekStart } },
            _sum: { questionsAnswered: true, correctAnswers: true },
        }),
        prisma.studyLog.aggregate({
            where: { userId },
            _sum: { questionsAnswered: true },
        }),
        prisma.weeklyPlan.findUnique({
            where: { userId_startDate: { userId, startDate: weekStart } },
            select: { items: { select: { completed: true } } },
        }),
    ])

    // Conjunto de dias estudados (chaves yyyy-mm-dd em Araguaína).
    const studiedDays = new Set(logs.map((l) => araguainaDateKey(l.date)))

    // currentStreak: dias consecutivos terminando em hoje (ou ontem se ainda não estudou hoje).
    let currentStreak = 0
    const cursor = new Date(`${todayKey}T12:00:00Z`)
    // Se não estudou hoje, a sequência ainda pode estar viva contando a partir de ontem.
    if (!studiedDays.has(araguainaDateKey(cursor))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
    while (studiedDays.has(araguainaDateKey(cursor))) {
        currentStreak++
        cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    // daysSinceLastLog: dias entre hoje e o log mais recente (0 = estudou hoje).
    const lastLogKey = logs.length > 0 ? araguainaDateKey(logs[0].date) : null
    const daysSinceLastLog = lastLogKey ? daysBetweenKeys(lastLogKey, todayKey) : Infinity

    const weeklyQuestions = weekAgg._sum.questionsAnswered ?? 0
    const weeklyCorrect = weekAgg._sum.correctAnswers ?? 0
    const weeklyAccuracy = weeklyQuestions > 0 ? (weeklyCorrect / weeklyQuestions) * 100 : 0

    const planItems = plan?.items ?? []
    const planCompletionRate = planItems.length > 0
        ? (planItems.filter((i) => i.completed).length / planItems.length) * 100
        : 0

    const accountAgeDays = user
        ? daysBetweenKeys(araguainaDateKey(user.createdAt), todayKey)
        : 0

    // Há dias úteis restantes enquanto não for sábado em Araguaína.
    const weekHasRemainingDays = araguainaWeekday(now) !== 6

    return {
        currentStreak,
        daysSinceLastLog,
        weeklyAccuracy,
        weeklyQuestions,
        planCompletionRate,
        allTimeQuestions: allTimeAgg._sum.questionsAnswered ?? 0,
        accountAgeDays,
        weekHasRemainingDays,
    }
}

function parseSimResult(raw: string): { correct: number; total: number } | null {
    const m = raw.trim().match(/^(\d+)\s*\/\s*(\d+)$/)
    if (!m) return null
    const correct = parseInt(m[1], 10)
    const total = parseInt(m[2], 10)
    if (total === 0 || correct > total) return null
    return { correct, total }
}

export async function buildV2Context(userId: string): Promise<V2MotivationContext> {
    const now = new Date()
    const todayKey = araguainaDateKey(now)

    const [user, grid, sims] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
        prisma.studyGrid.findFirst({
            where: { userId, active: true },
            select: {
                blocks: {
                    where: { visible: true },
                    select: {
                        contentBlocks: {
                            where: { visible: true },
                            select: {
                                topicBlocks: {
                                    where: { visible: true },
                                    select: {
                                        completed: true,
                                        updatedAt: true,
                                        f2Bool1: true,
                                        f2Bool2: true,
                                        f2Bool3: true,
                                        f2Bool4: true,
                                        f2Bool5: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.simulation.findMany({
            where: { grid: { userId, active: true } },
            select: { blocks: { select: { studentResult: true } } },
        }),
    ])

    const accountAgeDays = user
        ? daysBetweenKeys(araguainaDateKey(user.createdAt), todayKey)
        : 0

    // Fase 1 + Fase 2 a partir dos blocos do grid ativo.
    let fase1Total = 0
    let fase1Completed = 0
    let fase2Done = 0
    let fase2Total = 0
    let lastCompletedAt: Date | null = null

    for (const block of grid?.blocks ?? []) {
        const cadernos = [false, false, false, false, false]
        let hasAnyTopic = false
        for (const cb of block.contentBlocks) {
            for (const tb of cb.topicBlocks) {
                hasAnyTopic = true
                fase1Total++
                if (tb.completed) {
                    fase1Completed++
                    if (!lastCompletedAt || tb.updatedAt > lastCompletedAt) lastCompletedAt = tb.updatedAt
                }
                if (tb.f2Bool1) cadernos[0] = true
                if (tb.f2Bool2) cadernos[1] = true
                if (tb.f2Bool3) cadernos[2] = true
                if (tb.f2Bool4) cadernos[3] = true
                if (tb.f2Bool5) cadernos[4] = true
            }
        }
        if (hasAnyTopic) {
            fase2Total += 5
            fase2Done += cadernos.filter(Boolean).length
        }
    }

    const fase1Pct = fase1Total > 0 ? Math.round((fase1Completed / fase1Total) * 100) : null

    // Fase 3 — precisão média ponderada e contagem de simulados preenchidos.
    let simCorrect = 0
    let simTotal = 0
    let fase3Count = 0
    for (const sim of sims) {
        let anyFilled = false
        for (const b of sim.blocks) {
            if (!b.studentResult) continue
            const parsed = parseSimResult(b.studentResult)
            if (!parsed) continue
            anyFilled = true
            simCorrect += parsed.correct
            simTotal += parsed.total
        }
        if (anyFilled) fase3Count++
    }
    const fase3Pct = simTotal > 0 ? Math.round((simCorrect / simTotal) * 100) : null

    const daysSinceLastTopicCompleted = lastCompletedAt
        ? daysBetweenKeys(araguainaDateKey(lastCompletedAt), todayKey)
        : null

    return {
        accountAgeDays,
        fase1Pct,
        fase2Done,
        fase2Total,
        fase3Pct,
        fase3Count,
        daysSinceLastTopicCompleted,
    }
}
