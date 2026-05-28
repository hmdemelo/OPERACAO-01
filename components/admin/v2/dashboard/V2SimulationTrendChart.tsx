"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"
import {
    axisDefaults,
    lineDefaults,
    tooltipDefaults,
    chartTokens,
    referenceLineDefaults,
} from "@/lib/dashboard/chartTheme"
import type { SubjectSimulationTrend, V2StudentRow } from "@/lib/metrics/v2Metrics"

type StudentTrends = {
    student: V2StudentRow
    subjects: SubjectSimulationTrend[]
}

function SubjectTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as { label: string; pct: number; correct: number; total: number }
    return (
        <div className="tabular-nums" style={tooltipDefaults.contentStyle}>
            <p style={tooltipDefaults.labelStyle}>Simulado · {label}</p>
            <p style={{ padding: 0 }}>{d.correct}/{d.total} · {d.pct}%</p>
        </div>
    )
}

function SubjectSparkline({ trend }: { trend: SubjectSimulationTrend }) {
    const last = trend.points[trend.points.length - 1]
    const first = trend.points[0]
    const delta = last.pct - first.pct
    const direction = trend.points.length < 2 ? "—" : delta >= 0 ? `+${delta}` : `${delta}`

    return (
        <div className="rounded-lg border bg-card/50 p-3">
            <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-medium truncate" title={trend.subject}>
                    {trend.subject}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">
                    {last.pct}%
                    {trend.points.length >= 2 && (
                        <span className={delta >= 0 ? "text-emerald-600" : "text-destructive"}>
                            {" "}({direction}pp)
                        </span>
                    )}
                </span>
            </div>
            <ResponsiveContainer width="100%" height={48}>
                <LineChart data={trend.points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <XAxis dataKey="label" hide />
                    <YAxis domain={[0, 100]} hide />
                    <ReferenceLine y={50} {...referenceLineDefaults} />
                    <Tooltip {...tooltipDefaults} content={<SubjectTooltip />} />
                    <Line
                        {...lineDefaults}
                        dataKey="pct"
                        stroke={chartTokens.series.accent}
                        dot={{ r: 2, fill: chartTokens.series.accent, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export function V2SimulationTrendChart({
    students,
    trendsByStudent,
}: {
    students: V2StudentRow[]
    trendsByStudent: Map<string, SubjectSimulationTrend[]>
}) {
    const withTrends: StudentTrends[] = students
        .map(s => ({ student: s, subjects: trendsByStudent.get(s.id) || [] }))
        .filter(st => st.subjects.length > 0)

    if (withTrends.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Trajetória de simulados por matéria</h3>
                <p className="text-sm text-muted-foreground h-32 flex items-center justify-center">
                    Nenhum simulado preenchido ainda. Quando os alunos registrarem resultados, a evolução por matéria aparece aqui.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold">Trajetória de simulados por matéria</h3>
                <span className="text-xs text-muted-foreground">
                    Cada linha mostra a precisão ao longo dos simulados — linha de referência em 50%
                </span>
            </div>

            <div className="space-y-5">
                {withTrends.map(({ student, subjects }) => (
                    <div key={student.id}>
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm font-medium">{student.name}</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                                {student.fase3Count} {student.fase3Count === 1 ? "simulado" : "simulados"} · média {student.fase3Pct}%
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {subjects.map(trend => (
                                <SubjectSparkline key={trend.subject} trend={trend} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
