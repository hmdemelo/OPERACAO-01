import { prisma } from "@/lib/db"

/**
 * V2 metrics — funil de 3 fases.
 *
 *   Fase 1: aluno marca StudyTopicBlock.completed (estudou o tópico)
 *   Fase 2: aluno produziu 5 cadernos de erros por DISCIPLINA
 *           (f2Bool1..5 em qualquer StudyTopicBlock daquela disciplina = OR)
 *   Fase 3: aluno respondeu simulado, anotou "X/Y" em SimulationBlock.studentResult
 *
 * Nada aqui depende de StudyLog (V1). Alunos V2 não preenchem StudyLog.
 */

export type SubjectSimulationTrend = {
    subject: string
    /** Cronológico (mais antigo primeiro) — precisão em % por simulado realizado. */
    points: { label: string; pct: number; correct: number; total: number }[]
}

export type V2StudentRow = {
    id: string
    name: string
    /** % de tópicos visíveis com completed=true. Null = aluno sem grade. */
    fase1Pct: number | null
    fase1Completed: number
    fase1Total: number
    /** % de cadernos de erros produzidos (OR-agregados por disciplina ÷ 5×Ndisciplinas). Null = sem disciplinas visíveis. */
    fase2Pct: number | null
    fase2Done: number
    fase2Total: number
    /** Precisão média ponderada por questões em TODOS os simulados do aluno. Null = nenhum simulado preenchido. */
    fase3Pct: number | null
    fase3Correct: number
    fase3Total: number
    /** Quantos simulados o aluno já preencheu (qualquer bloco respondido conta como 1). */
    fase3Count: number
    /** Aluno escreveu pelo menos uma anotação em studentNotes? */
    hasErrorNotes: boolean
    /** Estado derivado: alunos com F1 alta mas F3 baixa = gap de transferência. */
    tone: "neutral" | "ok" | "warn" | "alert"
}

export type V2FleetSummary = {
    studentsTotal: number
    studentsWithGrid: number
    /** Médias agregadas SOMENTE entre alunos com dados em cada fase. */
    fase1Avg: number
    fase2Avg: number
    fase3Avg: number
    /** Alunos com F1 ≥ 60% mas F3 < 50% — sinalizam gap de transferência. */
    transferGapCount: number
}

function parseSimResult(raw: string): { correct: number; total: number } | null {
    const m = raw.trim().match(/^(\d+)\s*\/\s*(\d+)$/)
    if (!m) return null
    const correct = parseInt(m[1], 10)
    const total = parseInt(m[2], 10)
    if (total === 0 || correct > total) return null
    return { correct, total }
}

async function getV2Students(mentorId?: string) {
    const where: any = { role: "STUDENT", active: true, appVersion: "v2" }
    if (mentorId) where.studentLink = { mentorId }
    return prisma.user.findMany({ where, select: { id: true, name: true, email: true } })
}

/**
 * Per-V2-student funnel metrics (fase 1 → 2 → 3) plus per-subject simulation trends.
 * Two Prisma trips: one for grids (fase 1+2 sources), one for simulations (fase 3).
 */
export async function getV2StudentRows(mentorId?: string): Promise<{
    rows: V2StudentRow[]
    trendsByStudent: Map<string, SubjectSimulationTrend[]>
}> {
    const students = await getV2Students(mentorId)
    if (students.length === 0) return { rows: [], trendsByStudent: new Map() }

    const studentIds = students.map(s => s.id)

    const [grids, sims] = await Promise.all([
        prisma.studyGrid.findMany({
            where: { userId: { in: studentIds }, active: true },
            select: {
                userId: true,
                blocks: {
                    where: { visible: true },
                    select: {
                        subjectV2: { select: { id: true, name: true } },
                        contentBlocks: {
                            where: { visible: true },
                            select: {
                                topicBlocks: {
                                    where: { visible: true },
                                    select: {
                                        completed: true,
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
            where: { grid: { userId: { in: studentIds }, active: true } },
            orderBy: { date: "asc" },
            select: {
                date: true,
                title: true,
                grid: { select: { userId: true } },
                blocks: {
                    select: {
                        studentResult: true,
                        studentNotes: true,
                        studyBlock: { select: { subjectV2: { select: { name: true } } } },
                    },
                },
            },
        }),
    ])

    type Agg = { fase1Completed: number; fase1Total: number; fase2Done: number; fase2Total: number }
    const aggByUser = new Map<string, Agg>()

    for (const grid of grids) {
        const agg: Agg = { fase1Completed: 0, fase1Total: 0, fase2Done: 0, fase2Total: 0 }

        for (const block of grid.blocks) {
            const cadernos = [false, false, false, false, false]
            let hasAnyTopic = false
            for (const cb of block.contentBlocks) {
                for (const tb of cb.topicBlocks) {
                    hasAnyTopic = true
                    agg.fase1Total++
                    if (tb.completed) agg.fase1Completed++
                    if (tb.f2Bool1) cadernos[0] = true
                    if (tb.f2Bool2) cadernos[1] = true
                    if (tb.f2Bool3) cadernos[2] = true
                    if (tb.f2Bool4) cadernos[3] = true
                    if (tb.f2Bool5) cadernos[4] = true
                }
            }

            if (hasAnyTopic) {
                agg.fase2Total += 5
                agg.fase2Done += cadernos.filter(Boolean).length
            }
        }

        aggByUser.set(grid.userId, agg)
    }

    type SimAgg = {
        correct: number
        total: number
        count: number
        hasNotes: boolean
        bySubject: Map<string, SubjectSimulationTrend>
    }
    const simByUser = new Map<string, SimAgg>()

    for (const sim of sims) {
        const userId = sim.grid.userId
        let entry = simByUser.get(userId)
        if (!entry) {
            entry = { correct: 0, total: 0, count: 0, hasNotes: false, bySubject: new Map() }
            simByUser.set(userId, entry)
        }

        let anyFilledThisSim = false
        for (const block of sim.blocks) {
            if (block.studentNotes && block.studentNotes.trim().length > 0) entry.hasNotes = true
            if (!block.studentResult) continue
            const parsed = parseSimResult(block.studentResult)
            if (!parsed) continue

            anyFilledThisSim = true
            entry.correct += parsed.correct
            entry.total += parsed.total

            const subjName = block.studyBlock.subjectV2.name
            const subjPct = Math.round((parsed.correct / parsed.total) * 100)
            const label = `${String(sim.date.getDate()).padStart(2, "0")}/${String(sim.date.getMonth() + 1).padStart(2, "0")}`
            let trend = entry.bySubject.get(subjName)
            if (!trend) {
                trend = { subject: subjName, points: [] }
                entry.bySubject.set(subjName, trend)
            }
            trend.points.push({ label, pct: subjPct, correct: parsed.correct, total: parsed.total })
        }
        if (anyFilledThisSim) entry.count++
    }

    const rows: V2StudentRow[] = students.map(student => {
        const agg = aggByUser.get(student.id)
        const sim = simByUser.get(student.id)

        const fase1Pct = agg && agg.fase1Total > 0
            ? Math.round((agg.fase1Completed / agg.fase1Total) * 100)
            : null
        const fase2Pct = agg && agg.fase2Total > 0
            ? Math.round((agg.fase2Done / agg.fase2Total) * 100)
            : null
        const fase3Pct = sim && sim.total > 0
            ? Math.round((sim.correct / sim.total) * 100)
            : null

        let tone: V2StudentRow["tone"] = "neutral"
        if (fase1Pct !== null && fase3Pct !== null && fase1Pct >= 60 && fase3Pct < 50) {
            tone = "alert"
        } else if (fase1Pct !== null && fase1Pct < 25) {
            tone = "warn"
        } else if (fase3Pct !== null && fase3Pct >= 70) {
            tone = "ok"
        }

        return {
            id: student.id,
            name: student.name || student.email || "Sem nome",
            fase1Pct,
            fase1Completed: agg?.fase1Completed ?? 0,
            fase1Total: agg?.fase1Total ?? 0,
            fase2Pct,
            fase2Done: agg?.fase2Done ?? 0,
            fase2Total: agg?.fase2Total ?? 0,
            fase3Pct,
            fase3Correct: sim?.correct ?? 0,
            fase3Total: sim?.total ?? 0,
            fase3Count: sim?.count ?? 0,
            hasErrorNotes: sim?.hasNotes ?? false,
            tone,
        }
    })

    const trendsByStudent = new Map<string, SubjectSimulationTrend[]>()
    for (const [userId, agg] of simByUser) {
        trendsByStudent.set(userId, [...agg.bySubject.values()])
    }

    return { rows, trendsByStudent }
}

/**
 * Detailed single-student V2 report payload.
 * Used by the student report page when appVersion === "v2".
 *
 * Mentor-facing: includes per-subject breakdown for fase 2, simulation history
 * with all student notes, and fleet averages for benchmarking.
 */
export type V2StudentReport = {
    student: { id: string; name: string; email: string; concursos: string[] }
    row: V2StudentRow
    /** Per-subject fase 2 detail: which of the 5 cadernos are done. */
    fase2BySubject: { subject: string; cadernos: boolean[]; done: number }[]
    /** All simulations the student filled, most recent first. */
    simulations: {
        id: string
        date: string
        title: string
        totalCorrect: number
        totalQuestions: number
        pct: number
        blocks: { subject: string; result: string; pct: number | null; notes: string | null }[]
    }[]
    /** Per-subject trend (same as fleet view, but ordered ASC for charts). */
    trends: SubjectSimulationTrend[]
    /** Fleet averages — for "vs turma" comparison in the report. */
    fleetAvg: { fase1: number; fase2: number; fase3: number }
}

export async function getV2StudentReport(userId: string): Promise<V2StudentReport | null> {
    const student = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            appVersion: true,
            userConcursos: { include: { concurso: { select: { name: true } } } },
        },
    })
    if (!student) return null

    // Fleet averages — same mentor scope as the dashboard. We don't filter by
    // mentor here because the report endpoint already enforced that the caller
    // has access; comparing this student to their own mentor's cohort would
    // require an extra trip, and the global V2 average is the more honest
    // benchmark anyway.
    const { rows } = await getV2StudentRows()
    const row = rows.find(r => r.id === userId)
    if (!row) {
        return null
    }

    const fleet = summarizeV2Fleet(rows)

    // Fase 2 per-subject detail (re-query — needed at finer grain than the
    // aggregated row exposes).
    const grids = await prisma.studyGrid.findMany({
        where: { userId, active: true },
        select: {
            blocks: {
                where: { visible: true },
                select: {
                    subjectV2: { select: { name: true, order: true } },
                    contentBlocks: {
                        where: { visible: true },
                        select: {
                            topicBlocks: {
                                where: { visible: true },
                                select: {
                                    f2Bool1: true, f2Bool2: true, f2Bool3: true, f2Bool4: true, f2Bool5: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    const fase2BySubject: V2StudentReport["fase2BySubject"] = []
    for (const grid of grids) {
        for (const block of grid.blocks) {
            const cadernos = [false, false, false, false, false]
            let hasTopic = false
            for (const cb of block.contentBlocks) {
                for (const tb of cb.topicBlocks) {
                    hasTopic = true
                    if (tb.f2Bool1) cadernos[0] = true
                    if (tb.f2Bool2) cadernos[1] = true
                    if (tb.f2Bool3) cadernos[2] = true
                    if (tb.f2Bool4) cadernos[3] = true
                    if (tb.f2Bool5) cadernos[4] = true
                }
            }
            if (hasTopic) {
                fase2BySubject.push({
                    subject: block.subjectV2.name,
                    cadernos,
                    done: cadernos.filter(Boolean).length,
                })
            }
        }
    }
    fase2BySubject.sort((a, b) => a.subject.localeCompare(b.subject))

    // Full simulation history with notes
    const simRows = await prisma.simulation.findMany({
        where: { grid: { userId, active: true } },
        orderBy: { date: "desc" },
        select: {
            id: true,
            date: true,
            title: true,
            blocks: {
                select: {
                    studentResult: true,
                    studentNotes: true,
                    studyBlock: { select: { subjectV2: { select: { name: true } } } },
                },
            },
        },
    })

    const simulations: V2StudentReport["simulations"] = []
    for (const sim of simRows) {
        let totalCorrect = 0
        let totalQuestions = 0
        const blocks = sim.blocks.map(b => {
            const parsed = b.studentResult ? parseSimResult(b.studentResult) : null
            if (parsed) {
                totalCorrect += parsed.correct
                totalQuestions += parsed.total
            }
            return {
                subject: b.studyBlock.subjectV2.name,
                result: b.studentResult ?? "—",
                pct: parsed ? Math.round((parsed.correct / parsed.total) * 100) : null,
                notes: b.studentNotes && b.studentNotes.trim().length > 0 ? b.studentNotes : null,
            }
        })

        // Skip simulations where nothing was filled
        if (totalQuestions === 0 && blocks.every(b => !b.notes)) continue

        simulations.push({
            id: sim.id,
            date: sim.date.toISOString(),
            title: sim.title,
            totalCorrect,
            totalQuestions,
            pct: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            blocks,
        })
    }

    // Build chronological per-subject trend (ASC for the chart)
    const trendBySubject = new Map<string, SubjectSimulationTrend>()
    for (let i = simRows.length - 1; i >= 0; i--) {
        const sim = simRows[i]
        const label = `${String(sim.date.getDate()).padStart(2, "0")}/${String(sim.date.getMonth() + 1).padStart(2, "0")}`
        for (const block of sim.blocks) {
            if (!block.studentResult) continue
            const parsed = parseSimResult(block.studentResult)
            if (!parsed) continue
            const subject = block.studyBlock.subjectV2.name
            let trend = trendBySubject.get(subject)
            if (!trend) {
                trend = { subject, points: [] }
                trendBySubject.set(subject, trend)
            }
            trend.points.push({
                label,
                pct: Math.round((parsed.correct / parsed.total) * 100),
                correct: parsed.correct,
                total: parsed.total,
            })
        }
    }

    return {
        student: {
            id: student.id,
            name: student.name || student.email || "Sem nome",
            email: student.email,
            concursos: student.userConcursos.map(uc => uc.concurso.name),
        },
        row,
        fase2BySubject,
        simulations,
        trends: [...trendBySubject.values()],
        fleetAvg: { fase1: fleet.fase1Avg, fase2: fleet.fase2Avg, fase3: fleet.fase3Avg },
    }
}

export function summarizeV2Fleet(rows: V2StudentRow[]): V2FleetSummary {
    const withGrid = rows.filter(r => r.fase1Pct !== null)
    const withF2 = rows.filter(r => r.fase2Pct !== null)
    const withSim = rows.filter(r => r.fase3Pct !== null)

    const avg = (vals: number[]) =>
        vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0

    return {
        studentsTotal: rows.length,
        studentsWithGrid: withGrid.length,
        fase1Avg: avg(withGrid.map(r => r.fase1Pct as number)),
        fase2Avg: avg(withF2.map(r => r.fase2Pct as number)),
        fase3Avg: avg(withSim.map(r => r.fase3Pct as number)),
        transferGapCount: rows.filter(r => r.tone === "alert").length,
    }
}
