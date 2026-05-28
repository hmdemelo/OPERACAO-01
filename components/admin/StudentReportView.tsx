'use client'

import { useState, useEffect, useCallback } from 'react'
import { addDays, subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getAraguainaStartOfWeek } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts'
import {
    axisDefaults,
    barDefaults,
    lineDefaults,
    tooltipDefaults,
    chartMargin,
    chartTokens,
} from '@/lib/dashboard/chartTheme'
import {
    Printer,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Clock,
    Target,
    Activity,
    BookOpen,
    CheckSquare,
    ArrowLeft,
    Loader2,
} from 'lucide-react'
import Link from 'next/link'

type ReportData = {
    student: { name: string; email: string; targetExam: string | null; concursos: string[] }
    period: { type: string; startDate: string; endDate: string }
    current: {
        totalHours: number
        totalQuestions: number
        totalCorrect: number
        accuracy: number
        logCount: number
        activeDays: number
        performanceScore: number
    }
    previous: {
        totalHours: number
        totalQuestions: number
        accuracy: number
        activeDays?: number
        performanceScore?: number
    }
    dailyProgress: { date: string; hours: number; questions: number; accuracy: number; adherence?: number | null }[]
    subjectBreakdown: { subject: string; totalHours: number; totalQuestions: number; accuracy: number }[]
    planAdherence: {
        weeks: { label: string; hasPlan: boolean; totalBlocks: number; completedBlocks: number; progressPercentage: number }[]
        avgPercentage: number
    }
    alerts: string[]
}

function Delta({ current, previous, unit = '' }: { current: number; previous: number; unit?: string }) {
    const diff = current - previous
    if (previous === 0 && current === 0) return <span className="text-xs text-muted-foreground">—</span>
    if (Math.abs(diff) < 0.05) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" /> igual</span>
    const positive = diff > 0
    return (
        <span className={`text-xs flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}{diff.toFixed(1)}{unit}
        </span>
    )
}

function ProgressBar({ value }: { value: number }) {
    // Bar uses foreground (not primary hue) so the row stays monochrome —
    // the % number on the right carries the meaning, no double encoding.
    return (
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
                className="h-full bg-foreground/80 rounded-full"
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    )
}

function TufteTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="tabular-nums" style={tooltipDefaults.contentStyle}>
            <p style={tooltipDefaults.labelStyle}>{label}</p>
            {payload.map((entry: any) => {
                const suffix = entry.name === 'Acerto' || entry.name === 'Aderência' ? '%' : entry.name === 'Horas' ? 'h' : ''
                const val = typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value
                return (
                    <p key={entry.name} style={{ color: entry.color, padding: 0 }}>
                        {entry.name}: {val}{suffix}
                    </p>
                )
            })}
        </div>
    )
}

/**
 * offset:  0 = center, -1 = above, 1 = below. Separates multiple terminus
 * labels at the same x so they don't collide with axis ticks or each other.
 */
function makeTerminusLabel(label: string, color: string, lastIndex: number, unit = '', offset = 0) {
    return function TerminusLabel(props: any) {
        const { x, y, value, index } = props
        if (index !== lastIndex || value === null || value === undefined) return null
        return (
            <text x={x} y={y} dx={10} dy={3 + offset * 13} fontSize={10} fill={color} style={{ fontFamily: 'inherit' }}>
                {label} · {value}{unit}
            </text>
        )
    }
}

function scoreLabel(score: number): string {
    if (score >= 75) return 'ótimo'
    if (score >= 50) return 'bom'
    if (score >= 30) return 'regular'
    return 'crítico'
}

type Props = {
    userId: string
    initialPeriod?: 'week' | 'month' | 'all'
    initialDate?: string
}

export function StudentReportView({ userId, initialPeriod = 'week', initialDate }: Props) {
    const [period, setPeriod] = useState<'week' | 'month' | 'all'>(initialPeriod)
    const [anchorDate, setAnchorDate] = useState<Date>(() =>
        getAraguainaStartOfWeek(initialDate ?? new Date())
    )
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)

    const stepDays = period === 'month' ? 28 : 7

    const fetchReport = useCallback(async () => {
        setLoading(true)
        try {
            const url = period === 'all'
                ? `/api/admin/users/${userId}/report?period=all`
                : `/api/admin/users/${userId}/report?period=${period}&date=${format(anchorDate, 'yyyy-MM-dd')}`
            const res = await fetch(url)
            if (res.ok) setData(await res.json())
        } finally {
            setLoading(false)
        }
    }, [userId, period, anchorDate])

    useEffect(() => { fetchReport() }, [fetchReport])

    const periodLabel = data
        ? data.period.type === 'all'
            ? `${format(new Date(data.period.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} – hoje`
            : `${format(new Date(data.period.startDate), "dd 'de' MMMM", { locale: ptBR })} – ${format(new Date(data.period.endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
        : '...'

    const lastIndex = (data?.dailyProgress.length ?? 1) - 1
    const chartData = data?.dailyProgress.map(d => ({
        day: data.period.type === 'all'
            ? format(new Date(`${d.date}T12:00:00`), "dd/MM", { locale: ptBR })
            : format(new Date(`${d.date}T12:00:00`), 'dd/MM'),
        Horas: parseFloat(d.hours.toFixed(1)),
        Questões: d.questions,
        Acerto: d.questions > 0 ? parseFloat(d.accuracy.toFixed(1)) : null,
        Aderência: d.adherence ?? null,
    })) ?? []

    return (
        <div className="space-y-3 pb-16 print:space-y-2 print:pb-0 print:text-black">
            {/* Toolbar — hidden on print */}
            <div className="print:hidden flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar ao Dashboard
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period toggle */}
                    <div className="flex rounded-lg border overflow-hidden">
                        <button
                            onClick={() => setPeriod('week')}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${period === 'week' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Semanal
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${period === 'month' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setPeriod('all')}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${period === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Todo período
                        </button>
                    </div>

                    {/* Date navigation — hidden for 'all' */}
                    {period !== 'all' && (
                        <div className="flex items-center gap-0.5 rounded-lg border bg-background px-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAnchorDate(d => subDays(d, stepDays))}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-medium px-1 min-w-[120px] text-center capitalize">{periodLabel}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAnchorDate(d => addDays(d, stepDays))}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" size="sm" className="gap-1.5 h-7 px-2 text-xs" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir / PDF
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando relatório...
                </div>
            ) : !data ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">Erro ao carregar dados.</div>
            ) : (
                <>
                    {/* Report header — single line, no box. */}
                    <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-1 lg:gap-4 border-b pb-3 print:border-black/30">
                        <div className="flex items-baseline gap-3 flex-wrap min-w-0">
                            <h1 className="text-xl font-bold print:text-black">{data.student.name}</h1>
                            <span className="text-xs text-muted-foreground truncate print:text-black/70">{data.student.email}</span>
                            {data.student.concursos.length > 0 && (
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider print:text-black/70">
                                    {data.student.concursos.join(' · ')}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums print:text-black/70 shrink-0">
                            <span className="font-medium text-foreground print:text-black capitalize">{periodLabel}</span>
                            <span className="mx-2 opacity-50">·</span>
                            <span>Relatório {data.period.type === 'week' ? 'Semanal' : data.period.type === 'month' ? 'Mensal' : 'Completo'}</span>
                            <span className="mx-2 opacity-50">·</span>
                            <span>Gerado {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        </div>
                    </div>

                    {/* Alerts — inline pill row, no oversized container. */}
                    {data.alerts.length > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 print:border-destructive print:bg-transparent">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                            <span className="font-semibold text-xs text-destructive uppercase tracking-wider mr-1">Alertas</span>
                            <span className="text-sm text-destructive/90">
                                {data.alerts.join(' · ')}
                            </span>
                        </div>
                    )}

                    {/* KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:grid-cols-5">
                        {[
                            {
                                label: 'Horas Estudadas',
                                icon: Clock,
                                value: `${data.current.totalHours.toFixed(1)}h`,
                                delta: data.period.type !== 'all' ? <Delta current={data.current.totalHours} previous={data.previous.totalHours} unit="h" /> : null,
                            },
                            {
                                label: 'Questões',
                                icon: BookOpen,
                                value: data.current.totalQuestions.toLocaleString('pt-BR'),
                                delta: data.period.type !== 'all' ? <Delta current={data.current.totalQuestions} previous={data.previous.totalQuestions} /> : null,
                            },
                            {
                                label: '% Acerto',
                                icon: Target,
                                value: `${data.current.accuracy.toFixed(1)}%`,
                                delta: data.period.type !== 'all' ? <Delta current={data.current.accuracy} previous={data.previous.accuracy} unit="%" /> : null,
                                color: data.current.accuracy >= 75 ? 'text-green-600' : data.current.accuracy >= 50 ? 'text-yellow-600' : 'text-red-500',
                            },
                            {
                                label: 'Dias Ativos',
                                icon: Activity,
                                value: `${data.current.activeDays}d`,
                                delta: data.period.type !== 'all' && data.previous.activeDays !== undefined
                                    ? <Delta current={data.current.activeDays} previous={data.previous.activeDays} unit="d" />
                                    : null,
                            },
                            {
                                label: `Score · ${scoreLabel(data.current.performanceScore)}`,
                                icon: TrendingUp,
                                value: `${data.current.performanceScore}/100`,
                                delta: data.period.type !== 'all' && data.previous.performanceScore !== undefined
                                    ? <Delta current={data.current.performanceScore} previous={data.previous.performanceScore} />
                                    : null,
                                color: data.current.performanceScore >= 75 ? 'text-green-600' : data.current.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-500',
                            },
                        ].map(kpi => (
                            <div
                                key={kpi.label}
                                className="rounded-lg border bg-card px-3 py-2 print:border-black/30 print:bg-transparent"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate print:text-black/70">
                                        {kpi.label}
                                    </span>
                                    <kpi.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 print:hidden" />
                                </div>
                                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                                    <span className={`text-xl font-bold tabular-nums print:text-black ${kpi.color ?? ''}`}>
                                        {kpi.value}
                                    </span>
                                    {kpi.delta && <span className="shrink-0">{kpi.delta}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress chart */}
                    {chartData.length > 0 && (
                        <div className="rounded-lg border bg-card px-4 pt-3 pb-2 print:shadow-none print:break-inside-avoid print:border-black/30 print:bg-transparent print:px-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 print:text-black/70">
                                {data.period.type === 'all' ? 'Progresso semanal' : 'Progresso diário'}
                            </h3>
                            <ResponsiveContainer width="100%" height={160}>
                                <ComposedChart data={chartData} margin={{ ...chartMargin, right: 80 }}>
                                    <XAxis dataKey="day" {...axisDefaults} />
                                    <YAxis yAxisId="left" {...axisDefaults} width={28} />
                                    <YAxis yAxisId="right" orientation="right" {...axisDefaults} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
                                    <Tooltip {...tooltipDefaults} content={<TufteTooltip />} />
                                    <Bar yAxisId="left" dataKey="Horas" fill={chartTokens.series.accent} {...barDefaults} maxBarSize={28} />
                                    <Line yAxisId="right" dataKey="Acerto" stroke={chartTokens.series.print} {...lineDefaults} connectNulls>
                                        <LabelList dataKey="Acerto" content={makeTerminusLabel('Acerto', chartTokens.series.print, lastIndex, '%', -1)} />
                                    </Line>
                                    {data.period.type === 'all' && (
                                        <Line yAxisId="right" dataKey="Aderência" stroke={chartTokens.series.printMuted} {...lineDefaults} connectNulls={false}>
                                            <LabelList dataKey="Aderência" content={makeTerminusLabel('Aderência', chartTokens.series.printMuted, lastIndex, '%', 1)} />
                                        </Line>
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Subject breakdown + Adherence side by side on screen, stacked on print */}
                    <div className="grid md:grid-cols-2 gap-4 print-stack">
                        {/* Subject breakdown */}
                        <div className="rounded-lg border bg-card print:shadow-none print:break-inside-avoid print:border-black/30 print:bg-transparent overflow-hidden">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2 border-b print:text-black/70 print:border-black/30">
                                Distribuição por Matéria
                            </h3>
                            {data.subjectBreakdown.length === 0 ? (
                                <p className="text-xs text-muted-foreground px-3 py-3 print:text-black/70">Sem registros no período.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-[10px] h-7 py-1">Matéria</TableHead>
                                            <TableHead className="text-[10px] h-7 py-1 text-right">Horas</TableHead>
                                            <TableHead className="text-[10px] h-7 py-1 text-right">Questões</TableHead>
                                            <TableHead className="text-[10px] h-7 py-1 text-right">Acerto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.subjectBreakdown.map(s => (
                                            <TableRow key={s.subject}>
                                                <TableCell className="text-xs py-1.5 font-medium">{s.subject}</TableCell>
                                                <TableCell className="text-xs py-1.5 text-right tabular-nums">{s.totalHours.toFixed(1)}h</TableCell>
                                                <TableCell className="text-xs py-1.5 text-right tabular-nums">{s.totalQuestions}</TableCell>
                                                <TableCell className={`text-xs py-1.5 text-right tabular-nums font-semibold ${s.totalQuestions === 0 ? 'text-muted-foreground' : s.accuracy >= 75 ? 'text-green-600' : s.accuracy >= 50 ? 'text-yellow-600' : 'text-red-500'} print:text-black`}>
                                                    {s.totalQuestions === 0 ? '—' : `${s.accuracy.toFixed(1)}%`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {/* Plan adherence */}
                        <div className="rounded-lg border bg-card print:shadow-none print:break-inside-avoid print:border-black/30 print:bg-transparent">
                            <div className="flex items-center justify-between px-3 py-2 border-b print:border-black/30">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black/70">
                                    Aderência ao Plano de Estudo
                                </h3>
                                <span className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded border ${data.planAdherence.avgPercentage >= 75 ? 'text-green-600 border-green-500' : data.planAdherence.avgPercentage >= 50 ? 'text-yellow-600 border-yellow-500' : 'text-red-500 border-red-400'} print:text-black print:border-black/40`}>
                                    Média {data.planAdherence.avgPercentage}%
                                </span>
                            </div>
                            <div className="px-3 py-2 space-y-2">
                                {data.planAdherence.weeks.length === 0 ? (
                                    <p className="text-xs text-muted-foreground print:text-black/70">Sem plano no período.</p>
                                ) : (
                                    data.planAdherence.weeks.map(w => (
                                        <div key={w.label} className="space-y-1">
                                            <div className="flex justify-between text-[11px] gap-2">
                                                <span className="flex items-center gap-1.5 truncate print:text-black">
                                                    <CheckSquare className={`h-3 w-3 shrink-0 ${w.hasPlan ? 'text-muted-foreground' : 'text-muted-foreground/40'} print:text-black/60`} />
                                                    {w.label}
                                                </span>
                                                {w.hasPlan ? (
                                                    <span className="font-medium tabular-nums shrink-0 print:text-black">
                                                        {w.completedBlocks}/{w.totalBlocks} ({w.progressPercentage}%)
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground italic shrink-0 print:text-black/70">Sem plano</span>
                                                )}
                                            </div>
                                            {w.hasPlan
                                                ? <ProgressBar value={w.progressPercentage} />
                                                : <div className="w-full bg-muted/40 h-1.5 rounded-full border border-dashed border-muted-foreground/30 print:border-black/30" />
                                            }
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
