"use client"

import { useState } from "react"
import { ClipboardCheck, ChevronDown, ChevronUp, CheckCircle2, Clock, FileX } from "lucide-react"
import Link from "next/link"

type StudentAdherence = {
    id: string
    name: string
    hasPlan: boolean
    totalBlocks: number
    completedBlocks: number
    progressPercentage: number
    status: "COMPLETED" | "IN_PROGRESS" | "PENDING"
}

type DashboardScheduleAdherenceProps = {
    students: StudentAdherence[]
    avgAdherence: number
    withPlan: number
    withoutPlan: number
    completed: number
}

function getProgressColor(pct: number): string {
    if (pct >= 80) return "bg-emerald-500"
    if (pct >= 50) return "bg-amber-500"
    if (pct > 0) return "bg-orange-500"
    return "bg-gray-300 dark:bg-gray-600"
}

function getStatusBadge(status: string) {
    switch (status) {
        case "COMPLETED":
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Concluído
                </span>
            )
        case "IN_PROGRESS":
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    <Clock className="h-3 w-3" /> Em progresso
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    <FileX className="h-3 w-3" /> Sem plano
                </span>
            )
    }
}

export function DashboardScheduleAdherence({
    students,
    avgAdherence,
    withPlan,
    withoutPlan,
    completed,
}: DashboardScheduleAdherenceProps) {
    const MAX_VISIBLE = 6
    const [showAll, setShowAll] = useState(false)
    const visibleStudents = showAll ? students : students.slice(0, MAX_VISIBLE)
    const hasMore = students.length > MAX_VISIBLE

    return (
        <div className="rounded-xl border bg-card p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Aderência ao Cronograma</h3>
                    <span className="text-xs text-muted-foreground">Semana atual</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">{completed} concluíram</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">{withPlan - completed} em progresso</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                        <span className="text-muted-foreground">{withoutPlan} sem plano</span>
                    </div>
                </div>
            </div>

            {/* Average indicator */}
            {withPlan > 0 && (
                <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/40">
                    <span className="text-sm text-muted-foreground">Média geral:</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${getProgressColor(avgAdherence)}`}
                            style={{ width: `${avgAdherence}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold min-w-[3ch] text-right">{avgAdherence}%</span>
                </div>
            )}

            {/* Student list */}
            {students.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    Nenhum aluno encontrado.
                </div>
            ) : (
                <div className="space-y-2.5">
                    {visibleStudents.map((student) => (
                        <div key={student.id} className="flex items-center gap-3">
                            <Link
                                href={`/admin/users/${student.id}`}
                                className="text-sm font-medium w-36 truncate hover:underline"
                                title={student.name}
                            >
                                {student.name}
                            </Link>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(student.progressPercentage)}`}
                                    style={{ width: `${student.hasPlan ? student.progressPercentage : 0}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[3ch] text-right">
                                {student.hasPlan ? `${student.progressPercentage}%` : "—"}
                            </span>
                            {getStatusBadge(student.status)}
                        </div>
                    ))}
                </div>
            )}

            {/* Toggle */}
            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                    {showAll ? (
                        <>Mostrar menos <ChevronUp className="h-3 w-3" /></>
                    ) : (
                        <>Ver todos ({students.length}) <ChevronDown className="h-3 w-3" /></>
                    )}
                </button>
            )}
        </div>
    )
}
