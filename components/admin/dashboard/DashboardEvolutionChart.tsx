"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"

type WeekData = {
    week: string
    avgAccuracy: number
    totalQuestions: number
    totalHours: number
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg text-sm space-y-1">
            <p className="font-semibold">Semana de {label}</p>
            {payload.map((entry: any) => (
                <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: {entry.name === "Precisão" ? `${entry.value}%` : entry.value}
                </p>
            ))}
        </div>
    )
}

export function DashboardEvolutionChart({ data }: { data: WeekData[] }) {
    const hasData = data.some(d => d.totalQuestions > 0 || d.totalHours > 0)

    if (!hasData) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Evolução Semanal</h3>
                </div>
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Sem dados suficientes para mostrar tendências.
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Evolução Semanal</h3>
                <span className="text-xs text-muted-foreground ml-auto">Últimas 4 semanas</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="week"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalQuestions"
                        name="Questões"
                        stroke="hsl(221, 83%, 53%)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "hsl(221, 83%, 53%)" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalHours"
                        name="Horas"
                        stroke="hsl(142, 71%, 45%)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "hsl(142, 71%, 45%)" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgAccuracy"
                        name="Precisão"
                        stroke="hsl(38, 92%, 50%)"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: "hsl(38, 92%, 50%)" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
