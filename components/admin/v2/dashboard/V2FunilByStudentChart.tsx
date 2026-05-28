"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    ReferenceLine,
} from "recharts"
import {
    axisDefaults,
    barDefaults,
    tooltipDefaults,
    chartMargin,
    chartTokens,
    referenceLineDefaults,
} from "@/lib/dashboard/chartTheme"
import type { V2StudentRow } from "@/lib/metrics/v2Metrics"

type Datum = {
    name: string
    shortName: string
    fase1: number | null
    fase2: number | null
    fase3: number | null
    gap: boolean
}

function PhaseTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as Datum
    return (
        <div className="tabular-nums" style={tooltipDefaults.contentStyle}>
            <p style={tooltipDefaults.labelStyle}>{d.name}</p>
            <p style={{ padding: 0 }}>F1 · grade: {d.fase1 ?? "—"}{d.fase1 !== null && "%"}</p>
            <p style={{ padding: 0 }}>F2 · cadernos: {d.fase2 ?? "—"}{d.fase2 !== null && "%"}</p>
            <p style={{ padding: 0 }}>F3 · simulados: {d.fase3 ?? "—"}{d.fase3 !== null && "%"}</p>
            {d.gap && <p style={{ padding: 0, color: "hsl(var(--destructive))" }}>↘ gap de transferência</p>}
        </div>
    )
}

function PctLabel(props: any) {
    const { x, y, width, height, value } = props
    if (value === null || value === undefined) return null
    return (
        <text
            x={x + width + 4}
            y={y + height / 2}
            dy={3}
            fontSize={10}
            fill={chartTokens.axisLabel}
            style={{ fontFamily: "inherit", fontVariantNumeric: "tabular-nums" }}
        >
            {value}%
        </text>
    )
}

export function V2FunilByStudentChart({ students }: { students: V2StudentRow[] }) {
    const withAnyData = students.filter(
        s => s.fase1Pct !== null || s.fase2Pct !== null || s.fase3Pct !== null
    )

    if (withAnyData.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Funil de fases por aluno</h3>
                <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">
                    Nenhum aluno V2 com grade ativa ainda.
                </p>
            </div>
        )
    }

    const data: Datum[] = [...withAnyData]
        .sort((a, b) => (b.fase1Pct ?? -1) - (a.fase1Pct ?? -1))
        .map(s => ({
            name: s.name,
            shortName: s.name.length > 22 ? s.name.slice(0, 20) + "…" : s.name,
            fase1: s.fase1Pct,
            fase2: s.fase2Pct,
            fase3: s.fase3Pct,
            gap: s.tone === "alert",
        }))

    const gapCount = data.filter(d => d.gap).length

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold">Funil de fases por aluno</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {data.length} {data.length === 1 ? "aluno" : "alunos"}
                    {" "}· F1 grade · F2 cadernos · F3 simulados
                    {gapCount > 0 && (
                        <span className="text-destructive"> · {gapCount} com gap de transferência</span>
                    )}
                </span>
            </div>

            <ResponsiveContainer width="100%" height={Math.max(data.length * 64, 220)}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ ...chartMargin, right: 56, left: 0 }}
                    barCategoryGap={20}
                    barGap={2}
                >
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        {...axisDefaults}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                        type="category"
                        dataKey="shortName"
                        width={150}
                        {...axisDefaults}
                    />
                    <Tooltip
                        {...tooltipDefaults}
                        cursor={{ fill: "hsl(var(--muted) / 0.25)" }}
                        content={<PhaseTooltip />}
                    />

                    <ReferenceLine x={50} {...referenceLineDefaults} />
                    <ReferenceLine x={100} {...referenceLineDefaults} />

                    {/*
                      Three quantitative bars per student. Bertin's Value channel
                      (brightness) differentiates the three phases — same hue,
                      decreasing opacity. F1 is darkest (the foundation), F3
                      lightest (the outcome). Position carries the student.
                    */}
                    <Bar
                        {...barDefaults}
                        dataKey="fase1"
                        fill={chartTokens.series.accent}
                        maxBarSize={9}
                        name="Fase 1"
                    >
                        <LabelList dataKey="fase1" content={PctLabel} />
                    </Bar>
                    <Bar
                        {...barDefaults}
                        dataKey="fase2"
                        fill={chartTokens.series.accent}
                        fillOpacity={0.65}
                        maxBarSize={9}
                        name="Fase 2"
                    >
                        <LabelList dataKey="fase2" content={PctLabel} />
                    </Bar>
                    <Bar
                        {...barDefaults}
                        dataKey="fase3"
                        fill={chartTokens.series.accent}
                        fillOpacity={0.35}
                        maxBarSize={9}
                        name="Fase 3"
                    >
                        <LabelList dataKey="fase3" content={PctLabel} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-2" style={{ background: chartTokens.series.accent }} />
                    F1 — grade concluída
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-2" style={{ background: chartTokens.series.accent, opacity: 0.65 }} />
                    F2 — cadernos de erros (5 por disciplina)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-2" style={{ background: chartTokens.series.accent, opacity: 0.35 }} />
                    F3 — média ponderada em simulados
                </span>
            </div>
        </div>
    )
}
