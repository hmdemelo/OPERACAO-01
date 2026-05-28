import { BookOpenCheck, NotebookPen, ClipboardCheck } from "lucide-react"

type Props = {
    studentsTotal: number
    studentsWithGrid: number
    fase1Avg: number
    fase2Avg: number
    fase3Avg: number
    transferGapCount: number
}

function Tile({
    label,
    value,
    subtitle,
    icon,
    accent,
}: {
    label: string
    value: string
    subtitle: string
    icon: React.ReactNode
    accent: string
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                </div>
                <div className="rounded-lg p-2.5 bg-muted/50 flex-shrink-0">{icon}</div>
            </div>
        </div>
    )
}

function accentFor(pct: number, hasData: boolean): string {
    if (!hasData) return "bg-muted-foreground/30"
    if (pct >= 75) return "bg-emerald-500"
    if (pct >= 50) return "bg-amber-500"
    return "bg-red-500"
}

export function V2FunilKpis({
    studentsTotal,
    studentsWithGrid,
    fase1Avg,
    fase2Avg,
    fase3Avg,
    transferGapCount,
}: Props) {
    const hasGrid = studentsWithGrid > 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tile
                label="Fase 1 · Conclusão de grade"
                value={hasGrid ? `${fase1Avg}%` : "—"}
                subtitle={
                    hasGrid
                        ? `média entre ${studentsWithGrid} de ${studentsTotal} ${studentsTotal === 1 ? "aluno" : "alunos"}`
                        : "nenhum aluno V2 com grade ainda"
                }
                icon={<BookOpenCheck className="h-5 w-5 text-muted-foreground" />}
                accent={accentFor(fase1Avg, hasGrid)}
            />
            <Tile
                label="Fase 2 · Cadernos de erros"
                value={hasGrid ? `${fase2Avg}%` : "—"}
                subtitle={
                    hasGrid
                        ? `5 cadernos por disciplina · média da turma`
                        : "depende de uma grade ativa"
                }
                icon={<NotebookPen className="h-5 w-5 text-muted-foreground" />}
                accent={accentFor(fase2Avg, hasGrid)}
            />
            <Tile
                label="Fase 3 · Acertos em simulados"
                value={hasGrid && fase3Avg > 0 ? `${fase3Avg}%` : "—"}
                subtitle={
                    transferGapCount > 0
                        ? `${transferGapCount} ${transferGapCount === 1 ? "aluno" : "alunos"} com grade avançada e acerto baixo`
                        : "média ponderada por questões"
                }
                icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
                accent={accentFor(fase3Avg, fase3Avg > 0)}
            />
        </div>
    )
}
