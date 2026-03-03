"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, UserX, TrendingDown, Gauge } from "lucide-react"
import Link from "next/link"

type AlertStudent = {
    id: string
    name: string
    accuracy: number
    totalQuestions: number
    totalHours: number
}

type DashboardAlertPanelProps = {
    zeroActivity: AlertStudent[]
    lowAccuracy: AlertStudent[]
    lowActivity: AlertStudent[]
}

function AlertGroup({
    title,
    students,
    icon,
    bgColor,
    borderColor,
    textColor,
    renderDetail,
}: {
    title: string
    students: AlertStudent[]
    icon: React.ReactNode
    bgColor: string
    borderColor: string
    textColor: string
    renderDetail: (s: AlertStudent) => string
}) {
    if (students.length === 0) return null

    return (
        <div className={`rounded-lg border ${borderColor} ${bgColor} p-3`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className={`text-sm font-semibold ${textColor}`}>
                    {title} ({students.length})
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                    <Link
                        key={s.id}
                        href={`/admin/users/${s.id}`}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-background/80 hover:bg-background transition-colors ${textColor} font-medium`}
                    >
                        {s.name}
                        <span className="text-muted-foreground font-normal">
                            {renderDetail(s)}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export function DashboardAlertPanel({
    zeroActivity,
    lowAccuracy,
    lowActivity,
}: DashboardAlertPanelProps) {
    const totalAlerts = zeroActivity.length + lowAccuracy.length + lowActivity.length
    const [isExpanded, setIsExpanded] = useState(totalAlerts > 0 && totalAlerts <= 6)

    if (totalAlerts === 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Todos os alunos estão em dia neste período.
                </span>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors rounded-lg"
            >
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {totalAlerts} {totalAlerts === 1 ? "aluno precisa" : "alunos precisam"} de atenção
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-amber-600" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-amber-600" />
                )}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertGroup
                        title="Sem atividade"
                        students={zeroActivity}
                        icon={<UserX className="h-4 w-4 text-red-600 dark:text-red-400" />}
                        bgColor="bg-red-50/50 dark:bg-red-950/20"
                        borderColor="border-red-200 dark:border-red-800"
                        textColor="text-red-700 dark:text-red-300"
                        renderDetail={() => "0h · 0 questões"}
                    />
                    <AlertGroup
                        title="Precisão baixa"
                        students={lowAccuracy}
                        icon={<TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                        bgColor="bg-amber-50/50 dark:bg-amber-950/20"
                        borderColor="border-amber-200 dark:border-amber-800"
                        textColor="text-amber-700 dark:text-amber-300"
                        renderDetail={(s) => `${s.accuracy.toFixed(0)}%`}
                    />
                    <AlertGroup
                        title="Baixa atividade"
                        students={lowActivity}
                        icon={<Gauge className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                        bgColor="bg-orange-50/50 dark:bg-orange-950/20"
                        borderColor="border-orange-200 dark:border-orange-800"
                        textColor="text-orange-700 dark:text-orange-300"
                        renderDetail={(s) => `${s.totalQuestions} questões`}
                    />
                </div>
            )}
        </div>
    )
}
