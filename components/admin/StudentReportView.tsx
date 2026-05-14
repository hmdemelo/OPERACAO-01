'use client'

import { useState, useEffect, useCallback } from 'react'
import { addDays, subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getAraguainaStartOfWeek } from '@/lib/date-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
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
    dailyProgress: { date: string; hours: number; questions: number; accuracy: number }[]
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
    return (
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    )
}

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
            <p className="font-semibold">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: {entry.name === 'Acerto' ? `${entry.value.toFixed(1)}%` : entry.name === 'Horas' ? `${entry.value.toFixed(1)}h` : entry.value}
                </p>
            ))}
        </div>
    )
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
        ? period === 'all'
            ? `${format(new Date(data.period.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} – hoje`
            : `${format(new Date(data.period.startDate), "dd 'de' MMMM", { locale: ptBR })} – ${format(new Date(data.period.endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
        : '...'

    const chartData = data?.dailyProgress.map(d => ({
        day: period === 'all'
            ? format(new Date(`${d.date}-01T12:00:00`), 'MMM/yy', { locale: ptBR })
            : format(new Date(`${d.date}T12:00:00`), 'dd/MM'),
        Horas: parseFloat(d.hours.toFixed(1)),
        Questões: d.questions,
        Acerto: d.questions > 0 ? parseFloat(d.accuracy.toFixed(1)) : null,
    })) ?? []

    return (
        <div className="space-y-6 pb-16 print:space-y-4">
            {/* Toolbar — hidden on print */}
            <div className="print:hidden flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Dashboard
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period toggle */}
                    <div className="flex rounded-lg border overflow-hidden">
                        <button
                            onClick={() => setPeriod('week')}
                            className={`px-4 py-1.5 text-sm font-medium transition-colors ${period === 'week' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Semanal
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-4 py-1.5 text-sm font-medium transition-colors ${period === 'month' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setPeriod('all')}
                            className={`px-4 py-1.5 text-sm font-medium transition-colors ${period === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            Todo período
                        </button>
                    </div>

                    {/* Date navigation — hidden for 'all' */}
                    {period !== 'all' && (
                        <div className="flex items-center gap-1 rounded-lg border bg-background px-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAnchorDate(d => subDays(d, stepDays))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium px-1 min-w-[140px] text-center capitalize">{periodLabel}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAnchorDate(d => addDays(d, stepDays))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
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
                    {/* Report header */}
                    <div className="border rounded-xl p-6 print:border-none print:p-0 bg-card">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{data.student.name}</h1>
                                <p className="text-muted-foreground text-sm mt-0.5">{data.student.email}</p>
                                {data.student.concursos.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {data.student.concursos.map(c => (
                                            <Badge key={c} variant="secondary" className="bg-orange-500/10 text-orange-600 border-none text-[10px] uppercase tracking-wider">{c}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-right text-muted-foreground print:text-left">
                                <p className="font-semibold text-foreground capitalize">{periodLabel}</p>
                                <p className="text-xs mt-0.5">Relatório {period === 'week' ? 'Semanal' : period === 'month' ? 'Mensal (últimas 4 semanas)' : 'Completo (todo o período)'}</p>
                                <p className="text-xs mt-0.5">Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    {data.alerts.length > 0 && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm text-destructive mb-1">Alertas Ativos</p>
                                <ul className="space-y-0.5">
                                    {data.alerts.map(a => (
                                        <li key={a} className="text-sm text-destructive/80">• {a}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:grid-cols-5">
                        {[
                            {
                                label: 'Horas Estudadas',
                                icon: Clock,
                                value: `${data.current.totalHours.toFixed(1)}h`,
                                delta: period !== 'all' ? <Delta current={data.current.totalHours} previous={data.previous.totalHours} unit="h" /> : null,
                            },
                            {
                                label: 'Questões',
                                icon: BookOpen,
                                value: data.current.totalQuestions.toLocaleString('pt-BR'),
                                delta: period !== 'all' ? <Delta current={data.current.totalQuestions} previous={data.previous.totalQuestions} /> : null,
                            },
                            {
                                label: '% Acerto',
                                icon: Target,
                                value: `${data.current.accuracy.toFixed(1)}%`,
                                delta: period !== 'all' ? <Delta current={data.current.accuracy} previous={data.previous.accuracy} unit="%" /> : null,
                                color: data.current.accuracy >= 75 ? 'text-green-600' : data.current.accuracy >= 50 ? 'text-yellow-600' : 'text-red-500',
                            },
                            {
                                label: 'Dias Ativos',
                                icon: Activity,
                                value: `${data.current.activeDays}d`,
                                delta: period !== 'all' && data.previous.activeDays !== undefined
                                    ? <Delta current={data.current.activeDays} previous={data.previous.activeDays} unit="d" />
                                    : null,
                            },
                            {
                                label: 'Score',
                                icon: TrendingUp,
                                value: data.current.performanceScore,
                                delta: period !== 'all' && data.previous.performanceScore !== undefined
                                    ? <Delta current={data.current.performanceScore} previous={data.previous.performanceScore} />
                                    : null,
                                color: data.current.performanceScore >= 75 ? 'text-green-600' : data.current.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-500',
                            },
                        ].map(kpi => (
                            <Card key={kpi.label} className="print:shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
                                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <p className={`text-2xl font-bold ${kpi.color ?? ''}`}>{kpi.value}</p>
                                    <div className="mt-1">{kpi.delta}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Daily progress chart */}
                    {chartData.length > 0 && (
                        <Card className="print:shadow-none print:break-inside-avoid">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Progresso Diário</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar yAxisId="left" dataKey="Horas" fill="hsl(var(--primary))" opacity={0.8} radius={[3, 3, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="Acerto" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Subject breakdown + Adherence side by side */}
                    <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2">
                        {/* Subject breakdown */}
                        <Card className="print:shadow-none print:break-inside-avoid">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Distribuição por Matéria</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.subjectBreakdown.length === 0 ? (
                                    <p className="text-sm text-muted-foreground px-6 pb-4">Sem registros no período.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs">Matéria</TableHead>
                                                <TableHead className="text-xs text-right">Horas</TableHead>
                                                <TableHead className="text-xs text-right">Questões</TableHead>
                                                <TableHead className="text-xs text-right">Acerto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.subjectBreakdown.map(s => (
                                                <TableRow key={s.subject}>
                                                    <TableCell className="text-xs font-medium">{s.subject}</TableCell>
                                                    <TableCell className="text-xs text-right">{s.totalHours.toFixed(1)}h</TableCell>
                                                    <TableCell className="text-xs text-right">{s.totalQuestions}</TableCell>
                                                    <TableCell className={`text-xs text-right font-semibold ${s.totalQuestions === 0 ? 'text-muted-foreground' : s.accuracy >= 75 ? 'text-green-600' : s.accuracy >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                        {s.totalQuestions === 0 ? '—' : `${s.accuracy.toFixed(1)}%`}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Plan adherence */}
                        <Card className="print:shadow-none print:break-inside-avoid">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                    <span>Aderência ao Plano de Estudo</span>
                                    <Badge variant="outline" className={`text-xs ${data.planAdherence.avgPercentage >= 75 ? 'text-green-600 border-green-500' : data.planAdherence.avgPercentage >= 50 ? 'text-yellow-600 border-yellow-500' : 'text-red-500 border-red-400'}`}>
                                        Média: {data.planAdherence.avgPercentage}%
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.planAdherence.weeks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sem plano no período.</p>
                                ) : (
                                    data.planAdherence.weeks.map(w => (
                                        <div key={w.label} className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <CheckSquare className={`h-3.5 w-3.5 ${w.hasPlan ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                                                    {w.label}
                                                </span>
                                                {w.hasPlan ? (
                                                    <span className="font-medium">
                                                        {w.completedBlocks}/{w.totalBlocks} blocos ({w.progressPercentage}%)
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Sem plano</span>
                                                )}
                                            </div>
                                            {w.hasPlan
                                                ? <ProgressBar value={w.progressPercentage} />
                                                : <div className="w-full bg-secondary/40 h-2 rounded-full border border-dashed border-muted-foreground/30" />
                                            }
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
