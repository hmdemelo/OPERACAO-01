import { Users, Target, Clock, Activity, HelpCircle } from "lucide-react"

type KpiCardProps = {
    label: string
    value: string | number
    icon: React.ReactNode
    accentColor: string
    subtitle?: string
}

function KpiCard({ label, value, icon, accentColor, subtitle }: KpiCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                <div className={`rounded-lg p-2.5 bg-muted/50`}>
                    {icon}
                </div>
            </div>
        </div>
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
}

export function DashboardKpiCards({
    totalStudents,
    avgAccuracy,
    totalHours,
    engagementRate,
    totalQuestions,
    activeStudents,
}: DashboardKpiCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
                label="Alunos"
                value={totalStudents}
                subtitle={`${activeStudents} ativos`}
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
            />
            <KpiCard
                label="Precisão Média"
                value={`${avgAccuracy}%`}
                icon={<Target className="h-5 w-5 text-muted-foreground" />}
                accentColor={getAccuracyColor(avgAccuracy)}
            />
            <KpiCard
                label="Horas Totais"
                value={`${totalHours}h`}
                icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
            />
            <KpiCard
                label="Engajamento"
                value={`${engagementRate}%`}
                subtitle={`${activeStudents}/${totalStudents} ativos`}
                icon={<Activity className="h-5 w-5 text-muted-foreground" />}
                accentColor={getEngagementColor(engagementRate)}
            />
            <KpiCard
                label="Questões"
                value={totalQuestions.toLocaleString("pt-BR")}
                icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
                accentColor="bg-blue-500"
            />
        </div>
    )
}
