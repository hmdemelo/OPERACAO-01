"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts"
import {
    axisDefaults,
    barDefaults,
    tooltipDefaults,
    chartMargin,
    chartTokens,
} from "@/lib/dashboard/chartTheme"

type SubjectData = {
    subject: string
    totalHours: number
    totalQuestions: number
    accuracy: number
}

function TufteTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as SubjectData & { shortName: string }
    return (
        <div className="tabular-nums" style={tooltipDefaults.contentStyle}>
            <p style={tooltipDefaults.labelStyle}>{d.subject}</p>
            <p style={{ padding: 0 }}>{d.totalHours}h · {d.totalQuestions} questões · precisão {d.accuracy}%</p>
        </div>
    )
}

/**
 * Right-of-bar value label. Renders only for the bar's own row (LabelList
 * already scopes this), kept tight and tabular for legibility.
 */
function HoursLabel(props: any) {
    const { x, y, width, height, value } = props
    return (
        <text
            x={x + width + 6}
            y={y + height / 2}
            dy={4}
            fontSize={11}
            fill={chartTokens.axisLabel}
            style={{ fontFamily: "inherit", fontVariantNumeric: "tabular-nums" }}
        >
            {value}h
        </text>
    )
}

export function DashboardSubjectChart({ data }: { data: SubjectData[] }) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Horas estudadas por matéria</h3>
                <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">
                    Sem registros de estudo neste período. Marque logs para preencher esta visão.
                </p>
            </div>
        )
    }

    // Rank-sort: highest-studied subject at the top. Position carries the
    // primary ordering; length carries the magnitude. No hue required.
    const chartData = [...data]
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 8)
        .map(d => ({
            ...d,
            shortName: d.subject.length > 28 ? d.subject.slice(0, 26) + "…" : d.subject,
        }))

    const totalHours = chartData.reduce((sum, d) => sum + d.totalHours, 0)
    const subjects = chartData.length
    const top = chartData[0]

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold">Horas estudadas por matéria</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {subjects} {subjects === 1 ? "disciplina" : "disciplinas"} · {totalHours}h totais ·
                    {" "}mais estudada: {top.subject} ({top.totalHours}h)
                </span>
            </div>

            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 32, 180)}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ ...chartMargin, right: 56, left: 0 }}
                >
                    <XAxis
                        type="number"
                        {...axisDefaults}
                        tickFormatter={(v) => `${v}h`}
                    />
                    <YAxis
                        type="category"
                        dataKey="shortName"
                        width={190}
                        {...axisDefaults}
                    />
                    <Tooltip
                        {...tooltipDefaults}
                        cursor={{ fill: "hsl(var(--muted) / 0.25)" }}
                        content={<TufteTooltip />}
                    />

                    {/*
                      One fill token across every bar. Category is encoded
                      entirely by Y-Position (axis), magnitude by Length. Hue
                      would be redundant here — Bertin's rule applied strictly.
                      maxBarSize keeps bars hairline-thin (Tufte: high density).
                    */}
                    <Bar
                        {...barDefaults}
                        dataKey="totalHours"
                        fill={chartTokens.series.accent}
                        maxBarSize={14}
                    >
                        <LabelList dataKey="totalHours" content={HoursLabel} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
