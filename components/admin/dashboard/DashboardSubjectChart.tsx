"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { BookOpen } from "lucide-react"

type SubjectData = {
    subject: string
    totalHours: number
    totalQuestions: number
    accuracy: number
}

const COLORS = [
    "hsl(221, 83%, 53%)",  // blue
    "hsl(262, 83%, 58%)",  // violet
    "hsl(142, 71%, 45%)",  // green
    "hsl(38, 92%, 50%)",   // amber
    "hsl(346, 77%, 50%)",  // rose
    "hsl(199, 89%, 48%)",  // sky
    "hsl(24, 95%, 53%)",   // orange
    "hsl(280, 67%, 51%)",  // purple
]

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload as SubjectData
    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg text-sm space-y-1">
            <p className="font-semibold">{data.subject}</p>
            <p className="text-muted-foreground">{data.totalHours}h estudadas</p>
            <p className="text-muted-foreground">{data.totalQuestions} questões</p>
            <p className="text-muted-foreground">Precisão: {data.accuracy}%</p>
        </div>
    )
}

export function DashboardSubjectChart({ data }: { data: SubjectData[] }) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Horas por Matéria</h3>
                </div>
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Sem dados de estudo neste período.
                </div>
            </div>
        )
    }

    // Truncate subject names for display
    const chartData = data.slice(0, 8).map(d => ({
        ...d,
        shortName: d.subject.length > 18 ? d.subject.slice(0, 16) + "…" : d.subject,
    }))

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Horas por Matéria</h3>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 44, 200)}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis
                        type="number"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}h`}
                    />
                    <YAxis
                        type="category"
                        dataKey="shortName"
                        width={130}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                    <Bar dataKey="totalHours" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
