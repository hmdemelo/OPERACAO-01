import { Users, Target, Clock, Activity, HelpCircle, BookOpen } from "lucide-react"

type KpiCardProps = {
    label: string
    value: string | number
    icon: React.ReactNode
    accentColor: string
    subtitle?: string | React.ReactNode
    riskBadge?: React.ReactNode
}

function KpiCard({ label, value, icon, accentColor, subtitle, riskBadge }: KpiCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                    )}
                    {riskBadge && (
                        <div className="mt-2">
                            {riskBadge}
                        </div>
                    )}
                </div>
                <div className={`rounded-lg p-2.5 bg-muted/50 flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function Delta({ current, prev, suffix = '' }: { current: number; prev: number | null | undefined; suffix?: string }) {
    if (prev === undefined || prev === null) return null
    const diff = current - prev
    if (Math.abs(diff) < 0.05) return null
    const positive = diff > 0
    return (
        <span className={`text-xs font-medium flex items-center gap-0.5 mt-1 ${positive ? 'text-green-500' : 'text-red-400'}`}>
            {positive ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}{suffix}
        </span>
    )
}

function getAccuracyColor(accuracy: number): string {
    if (accuracy >= 75) return "bg-emerald-500"
    if (accuracy >= 50) return "bg-amber-500"
    return "bg-red-500"
}

function getEngagementColor(rate: number): string {
    if (rate >= 80) return "bg-emerald-500"
    if (rate >= 50) return "bg-amber-500"
    return "bg-red-500"
}

type DashboardKpiCardsProps = {
    totalStudents: number
    avgAccuracy: number
    totalHours: number
    engagementRate: number
    totalQuestions: number
    activeStudents: number
    riskCount: number
    planAdherenceAvg: number
    previous: {
        avgAccuracy: number
        totalHours: number
        totalQuestions: number
        engagementRate: number
        activeStudents: number
    } | null
}

export function DashboardKpiCards({
    totalStudents,
    avgAccuracy,
    totalHours,
    engagementRate,
    totalQuestions,
    activeStudents,
    riskCount,
    planAdherenceAvg,
    previous,
}: DashboardKpiCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
                label="Alunos"
                value={totalStudents}
                subtitle={`${activeStudents} ativos`}
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
                riskBadge={riskCount > 0 ? (
                    <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 inline-block px-2 py-0.5 rounded">
                        {riskCount} em risco
                    </span>
                ) : undefined}
            />
            <KpiCard
                label="Precisão Média"
                value={`${avgAccuracy}%`}
                icon={<Target className="h-5 w-5 text-muted-foreground" />}
                accentColor={getAccuracyColor(avgAccuracy)}
                subtitle={<Delta current={avgAccuracy} prev={previous?.avgAccuracy} suffix="p.p." />}
            />
            <KpiCard
                label="Horas Totais"
                value={`${totalHours}h`}
                subtitle={`${totalStudents > 0 ? (totalHours / totalStudents).toFixed(1) : '—'}h/aluno`}
                icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
                riskBadge={<Delta current={totalHours} prev={previous?.totalHours} suffix="h" />}
            />
            <KpiCard
                label="Questões"
                value={totalQuestions.toLocaleString("pt-BR")}
                subtitle={`${totalStudents > 0 ? (totalQuestions / totalStudents).toFixed(0) : '—'}/aluno`}
                icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
                riskBadge={<Delta current={totalQuestions} prev={previous?.totalQuestions} suffix="" />}
            />
            <KpiCard
                label="Participação"
                value={`${engagementRate}%`}
                subtitle={`${activeStudents}/${totalStudents} ativos`}
                icon={<Activity className="h-5 w-5 text-muted-foreground" />}
                accentColor={getEngagementColor(engagementRate)}
                riskBadge={<Delta current={engagementRate} prev={previous?.engagementRate} suffix="p.p." />}
            />
            <KpiCard
                label="Aderência ao P.E."
                value={`${planAdherenceAvg}%`}
                subtitle="semana atual"
                icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
                accentColor={getEngagementColor(planAdherenceAvg)}
            />
        </div>
    )
}
