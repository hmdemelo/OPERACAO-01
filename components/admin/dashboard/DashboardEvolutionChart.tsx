"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts"
import {
    axisDefaults,
    lineDefaults,
    tooltipDefaults,
    chartMargin,
    chartTokens,
} from "@/lib/dashboard/chartTheme"

type WeekData = {
    week: string
    avgAccuracy: number
    totalQuestions: number
    totalHours: number
    Tendência?: number
}

function calcTrendLine(values: number[]): number[] {
    const n = values.length
    if (n < 2) return values
    const sumX = (n * (n - 1)) / 2
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    const sumY = values.reduce((a, v) => a + v, 0)
    const sumXY = values.reduce((a, v, i) => a + i * v, 0)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    return values.map((_, i) => parseFloat((intercept + slope * i).toFixed(1)))
}

/**
 * Terminus-only label renderer with vertical offset to prevent overlap.
 * offset: -1 = above, 0 = center, 1 = below — spaced 13px apart.
 */
function makeTerminusLabel(label: string, color: string, lastIndex: number, unit = "", offset = 0) {
    return function TerminusLabel(props: any) {
        const { x, y, value, index } = props
        if (index !== lastIndex) return null
        return (
            <text
                x={x}
                y={y}
                dx={6}
                dy={3 + offset * 13}
                fontSize={10}
                fill={color}
                style={{ fontFamily: "inherit" }}
            >
                {label} · {value}{unit}
            </text>
        )
    }
}

function TufteTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div
            className="tabular-nums"
            style={tooltipDefaults.contentStyle}
        >
            <p style={tooltipDefaults.labelStyle}>Semana de {label}</p>
            {payload.map((entry: any) => {
                const suffix = entry.name === "Precisão" || entry.name === "Tendência" ? "%" : ""
                return (
                    <p key={entry.name} style={{ color: entry.color, padding: 0 }}>
                        {entry.name}: {entry.value}{suffix}
                    </p>
                )
            })}
        </div>
    )
}

export function DashboardEvolutionChart({ data }: { data: WeekData[] }) {
    const hasData = data.some(d => d.totalQuestions > 0 || d.totalHours > 0)

    if (!hasData) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Evolução semanal</h3>
                <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">
                    Sem registros nas últimas 4 semanas. Marque estudos para acompanhar a tendência.
                </p>
            </div>
        )
    }

    const trendValues = calcTrendLine(data.map(d => d.avgAccuracy))
    const chartData = data.map((d, i) => ({ ...d, Tendência: trendValues[i] }))
    const lastIndex = chartData.length - 1
    const trendDelta = trendValues[lastIndex] - trendValues[0]
    const direction = trendDelta >= 0 ? "subiu" : "caiu"

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold">Evolução semanal</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                    Últimas 4 semanas · precisão {direction} {Math.abs(trendDelta).toFixed(1)}%
                </span>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ ...chartMargin, right: 88 }}>
                    <XAxis dataKey="week" {...axisDefaults} />
                    <YAxis yAxisId="left" {...axisDefaults} width={32} />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        {...axisDefaults}
                        tickFormatter={(v) => `${v}%`}
                        width={36}
                    />

                    <Tooltip {...tooltipDefaults} content={<TufteTooltip />} />

                    {/*
                      Three quantitative series. Bertin's Value channel
                      (brightness) differentiates the two left-axis lines; the
                      right-axis line uses Position (separate axis) plus one
                      accent token. No hue is being used to encode category.
                    */}
                    <Line
                        yAxisId="left"
                        {...lineDefaults}
                        dataKey="totalQuestions"
                        name="Questões"
                        stroke={chartTokens.series.primary}
                    >
                        <LabelList
                            dataKey="totalQuestions"
                            content={makeTerminusLabel("Questões", chartTokens.series.primary, lastIndex, "", -1)}
                        />
                    </Line>

                    <Line
                        yAxisId="left"
                        {...lineDefaults}
                        dataKey="totalHours"
                        name="Horas"
                        stroke={chartTokens.series.secondary}
                    >
                        <LabelList
                            dataKey="totalHours"
                            content={makeTerminusLabel("Horas", chartTokens.series.secondary, lastIndex, "", 1)}
                        />
                    </Line>

                    <Line
                        yAxisId="right"
                        {...lineDefaults}
                        dataKey="avgAccuracy"
                        name="Precisão"
                        stroke={chartTokens.series.accent}
                    >
                        <LabelList
                            dataKey="avgAccuracy"
                            content={makeTerminusLabel("Precisão", chartTokens.series.accent, lastIndex, "%")}
                        />
                    </Line>

                    {/* Trend — Bertin's Texture variable (dashed) marks it as derived. */}
                    <Line
                        yAxisId="right"
                        {...lineDefaults}
                        dataKey="Tendência"
                        stroke={chartTokens.series.trend}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        legendType="none"
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
