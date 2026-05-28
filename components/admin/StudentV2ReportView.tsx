'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts'
import {
    axisDefaults,
    lineDefaults,
    tooltipDefaults,
    chartTokens,
    referenceLineDefaults,
} from '@/lib/dashboard/chartTheme'
import {
    Printer,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Check,
    BookOpenCheck,
    NotebookPen,
    ClipboardCheck,
} from 'lucide-react'
import type { V2StudentReport } from '@/lib/metrics/v2Metrics'

type ReportPayload = V2StudentReport & { version: 'v2' }

function FunilTile({
    label,
    icon,
    pct,
    detail,
    fleetAvg,
    accent,
}: {
    label: string
    icon: React.ReactNode
    pct: number | null
    detail: string
    fleetAvg: number
    accent: string
}) {
    const delta = pct !== null ? pct - fleetAvg : null
    return (
        <div className="relative overflow-hidden rounded-lg border bg-card px-3 py-2 print:border-black/30 print:bg-transparent">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accent} print:hidden`} />
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate print:text-black/70">
                    {label}
                </span>
                <span className="shrink-0 print:hidden">{icon}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <span className="text-xl font-bold tabular-nums print:text-black">
                    {pct !== null ? `${pct}%` : '—'}
                </span>
                {delta !== null && (
                    <span className={`text-[10px] tabular-nums shrink-0 ${delta >= 0 ? 'text-green-600 print:text-black' : 'text-destructive print:text-black'}`}>
                        {delta >= 0 ? '+' : ''}{delta}pp vs {fleetAvg}%
                    </span>
                )}
            </div>
            <p className="text-[10px] text-muted-foreground print:text-black/70 truncate">{detail}</p>
        </div>
    )
}

function accentFor(pct: number | null): string {
    if (pct === null) return 'bg-muted-foreground/30'
    if (pct >= 75) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-amber-500'
    return 'bg-red-500'
}

function SubjectTrendTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as { label: string; pct: number; correct: number; total: number }
    return (
        <div className="tabular-nums" style={tooltipDefaults.contentStyle}>
            <p style={tooltipDefaults.labelStyle}>Simulado · {label}</p>
            <p style={{ padding: 0 }}>{d.correct}/{d.total} · {d.pct}%</p>
        </div>
    )
}

export function StudentV2ReportView({ userId }: { userId: string }) {
    const [data, setData] = useState<ReportPayload | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/users/${userId}/report`)
                if (!res.ok) return
                const json = await res.json()
                if (!cancelled) setData(json)
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => { cancelled = true }
    }, [userId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando relatório...
            </div>
        )
    }

    if (!data) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Erro ao carregar dados.</div>
    }

    const { student, row, fase2BySubject, simulations, trends, fleetAvg } = data
    const hasGap = row.tone === 'alert'

    return (
        <div className="space-y-3 pb-16 print:space-y-2 print:pb-0 print:text-black">
            {/* Toolbar — hidden on print */}
            <div className="print:hidden flex items-center justify-between">
                <Link href="/admin/v2/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar ao Analytics V2
                </Link>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir / PDF
                </button>
            </div>

            {/* Header — single line. */}
            <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-1 lg:gap-4 border-b pb-3 print:border-black/30">
                <div className="flex items-baseline gap-3 flex-wrap min-w-0">
                    <h1 className="text-xl font-bold print:text-black">{student.name}</h1>
                    <span className="text-xs text-muted-foreground truncate print:text-black/70">{student.email}</span>
                    {student.concursos.length > 0 && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider print:text-black/70">
                            {student.concursos.join(' · ')}
                        </span>
                    )}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums print:text-black/70 shrink-0">
                    <span className="font-medium text-foreground print:text-black">Relatório V2 · Funil de Fases</span>
                    <span className="mx-2 opacity-50">·</span>
                    <span>Gerado {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
            </div>

            {/* Gap banner */}
            {hasGap && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 print:border-destructive print:bg-transparent">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span className="font-semibold text-xs text-destructive uppercase tracking-wider mr-1 print:text-black">Alerta</span>
                    <span className="text-sm text-destructive/90 print:text-black">
                        Gap de transferência: grade avançada ({row.fase1Pct}%) mas acerto baixo em simulados ({row.fase3Pct}%).
                    </span>
                </div>
            )}

            {/* 3 KPIs (F1, F2, F3) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:grid-cols-3 print:break-inside-avoid">
                <FunilTile
                    label="Fase 1 · Grade"
                    icon={<BookOpenCheck className="h-5 w-5 text-muted-foreground" />}
                    pct={row.fase1Pct}
                    detail={row.fase1Total > 0 ? `${row.fase1Completed} de ${row.fase1Total} tópicos` : 'sem grade ativa'}
                    fleetAvg={fleetAvg.fase1}
                    accent={accentFor(row.fase1Pct)}
                />
                <FunilTile
                    label="Fase 2 · Cadernos de erros"
                    icon={<NotebookPen className="h-5 w-5 text-muted-foreground" />}
                    pct={row.fase2Pct}
                    detail={row.fase2Total > 0 ? `${row.fase2Done} de ${row.fase2Total} cadernos` : 'sem disciplinas visíveis'}
                    fleetAvg={fleetAvg.fase2}
                    accent={accentFor(row.fase2Pct)}
                />
                <FunilTile
                    label="Fase 3 · Simulados"
                    icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
                    pct={row.fase3Pct}
                    detail={row.fase3Total > 0 ? `${row.fase3Correct}/${row.fase3Total} · ${row.fase3Count} simulado(s)` : 'nenhum simulado'}
                    fleetAvg={fleetAvg.fase3}
                    accent={accentFor(row.fase3Pct)}
                />
            </div>

            {/* Fase 2 detail per subject */}
            {fase2BySubject.length > 0 && (
                <div className="rounded-lg border bg-card print:border-black/30 print:bg-transparent print:break-inside-avoid overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b print:border-black/30">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black/70">
                            Cadernos de erros por disciplina
                        </h3>
                        <span className="text-[10px] text-muted-foreground print:text-black/70">
                            5 cadernos esperados por disciplina (Fase 2)
                        </span>
                    </div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b print:border-black/30">
                                <th className="text-left px-3 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">Disciplina</th>
                                <th className="text-center px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">1</th>
                                <th className="text-center px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">2</th>
                                <th className="text-center px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">3</th>
                                <th className="text-center px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">4</th>
                                <th className="text-center px-1.5 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">5</th>
                                <th className="text-right px-3 py-1.5 text-[10px] font-medium text-muted-foreground print:text-black/70">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fase2BySubject.map((s, idx) => (
                                <tr key={s.subject} className={idx % 2 === 0 ? '' : 'bg-muted/10 print:bg-transparent'}>
                                    <td className="px-3 py-1.5 font-medium print:text-black">{s.subject}</td>
                                    {s.cadernos.map((done, i) => (
                                        <td key={i} className="text-center px-1.5 py-1.5">
                                            {done ? (
                                                <Check className="h-3.5 w-3.5 inline text-foreground print:text-black" aria-label="caderno produzido" />
                                            ) : (
                                                <span className="text-muted-foreground/40 print:text-black/40">—</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="text-right px-3 py-1.5 tabular-nums font-semibold print:text-black">
                                        {s.done}/5
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Per-subject simulation trends */}
            {trends.length > 0 && (
                <div className="rounded-lg border bg-card print:border-black/30 print:bg-transparent print:break-inside-avoid overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b print:border-black/30">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black/70">
                            Trajetória dos simulados por matéria
                        </h3>
                        <span className="text-[10px] text-muted-foreground print:text-black/70">
                            Linha de referência em 50%
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                        {trends.map(trend => {
                            const last = trend.points[trend.points.length - 1]
                            const first = trend.points[0]
                            const delta = last.pct - first.pct
                            const showDelta = trend.points.length >= 2
                            return (
                                <div key={trend.subject} className="rounded-lg border bg-card/50 p-3 print:border-black/30 print:bg-transparent">
                                    <div className="flex items-baseline justify-between mb-1.5">
                                        <span className="text-xs font-medium truncate print:text-black" title={trend.subject}>
                                            {trend.subject}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2 print:text-black/70">
                                            {last.pct}%
                                            {showDelta && (
                                                <span className={delta >= 0 ? 'text-emerald-600 print:text-black' : 'text-destructive print:text-black'}>
                                                    {' '}({delta >= 0 ? '+' : ''}{delta}pp)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={56}>
                                        <LineChart data={trend.points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                            <XAxis dataKey="label" hide />
                                            <YAxis domain={[0, 100]} hide />
                                            <ReferenceLine y={50} {...referenceLineDefaults} />
                                            <Tooltip {...tooltipDefaults} content={<SubjectTrendTooltip />} />
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
                        })}
                    </div>
                </div>
            )}

            {/* Simulation history with notes */}
            {simulations.length > 0 && (
                <div className="rounded-lg border bg-card print:border-black/30 print:bg-transparent overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b print:border-black/30">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black/70">
                            Simulados realizados
                        </h3>
                        <span className="text-[10px] text-muted-foreground print:text-black/70">
                            {simulations.length} {simulations.length === 1 ? 'simulado' : 'simulados'} · do mais recente ao mais antigo
                        </span>
                    </div>
                    <div className="p-2 space-y-2">
                        {simulations.map(sim => (
                            <div
                                key={sim.id}
                                className="rounded border px-3 py-2 print:border-black/30 print:break-inside-avoid"
                            >
                                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-xs print:text-black truncate">{sim.title}</p>
                                        <p className="text-[10px] text-muted-foreground print:text-black/70">
                                            {format(new Date(sim.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-base font-bold tabular-nums print:text-black">
                                            {sim.totalQuestions > 0 ? `${sim.pct}%` : '—'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums print:text-black/70 ml-1.5">
                                            {sim.totalQuestions > 0 ? `${sim.totalCorrect}/${sim.totalQuestions}` : 'sem resultados'}
                                        </span>
                                    </div>
                                </div>

                                {sim.blocks.length > 0 && (
                                    <div className="border-t pt-1.5 mt-1.5 space-y-1 print:border-black/30">
                                        {sim.blocks.map((block, i) => (
                                            <div key={i} className="text-[11px]">
                                                <div className="flex justify-between gap-2">
                                                    <span className="font-medium print:text-black truncate">{block.subject}</span>
                                                    <span className="text-muted-foreground tabular-nums shrink-0 print:text-black/70">
                                                        {block.result}
                                                        {block.pct !== null && ` · ${block.pct}%`}
                                                    </span>
                                                </div>
                                                {block.notes && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 pl-2 border-l-2 border-muted print:text-black/70 print:border-black/30 italic">
                                                        {block.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty-state fallback */}
            {simulations.length === 0 && fase2BySubject.length === 0 && row.fase1Pct === null && (
                <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground print:border-black/30 print:bg-transparent">
                    Este aluno ainda não tem dados V2 registrados (grade, cadernos de erros ou simulados).
                </div>
            )}
        </div>
    )
}
