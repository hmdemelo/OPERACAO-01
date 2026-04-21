"use client"

import { logger } from "@/lib/logger";
import { useState } from "react"
import { ActivityHeatmap } from "@/components/admin/users/ActivityHeatmap"
import { AdminStudentWeeklyPlan } from "./AdminStudentWeeklyPlan"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { ChevronUp, BarChart2, Loader2, Calendar, FileText } from "lucide-react"
import Link from "next/link"

type DashboardStudentRowProps = {
    user: {
        id: string
        name: string | null
        email: string | null
    }
    stats: {
        accuracy: number
        questions: number
        hours: number
    }
    rank: number
}

export function DashboardStudentRow({ user, stats, rank }: DashboardStudentRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [heatmapData, setHeatmapData] = useState<any[]>([])
    const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false)

    // Inline Detail State
    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

    const toggleExpand = async () => {
        const nextState = !isExpanded
        setIsExpanded(nextState)

        if (nextState && heatmapData.length === 0) {
            setIsLoadingHeatmap(true)
            try {
                // Fetch last 60 days for compact view
                const res = await fetch(`/api/admin/users/${user.id}/heatmap?days=60`)
                if (res.ok) {
                    const data = await res.json()
                    setHeatmapData(data)
                }
            } catch (err) {
                logger.error("Failed to fetch heatmap", err)
            } finally {
                setIsLoadingHeatmap(false)
            }
        }
    }

    const fetchLogsForDate = async (dateStr: string) => {
        const date = new Date(`${dateStr}T12:00:00.000-03:00`)
        setSelectedDate(date)
    }

    return (
        <>
            <TableRow className={`${isExpanded ? "bg-muted/30" : "hover:bg-muted/10"} transition-colors`}>
                <TableCell className="font-mono text-muted-foreground pl-6">#{rank}</TableCell>
                <TableCell className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={toggleExpand}>
                    <div className="flex flex-col">
                        <span className="text-primary hover:underline">{user.name || "Sem nome"}</span>
                    </div>
                </TableCell>
                <TableCell className={`font-bold text-lg text-right ${stats.accuracy >= 80 ? "text-green-600 dark:text-green-400" :
                    stats.accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                        "text-red-600 dark:text-red-400"
                    }`}>
                    {stats.accuracy.toFixed(0)}%
                </TableCell>
                <TableCell className="text-sm text-right">{stats.questions}</TableCell>
                <TableCell className="text-sm text-right">{stats.hours.toFixed(1)}h</TableCell>
                <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleExpand}
                            className="gap-2"
                            disabled={isLoadingHeatmap}
                        >
                            {isLoadingHeatmap ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <BarChart2 className="h-4 w-4" />
                            )}
                            {isExpanded ? "Ocultar" : "Ver Atividade"}
                        </Button>
                        <Link href={`/admin/students/${user.id}/report`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Relatório
                            </Button>
                        </Link>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Content: Heatmap & Weekly Plan side-by-side */}
            {isExpanded && (
                <TableRow className="bg-muted/10 border-b">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-4 pl-8 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* Left: Heatmap */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Consistência (60 dias)
                                    </p>
                                    <ActivityHeatmap
                                        data={heatmapData}
                                        days={60}
                                        compact={true}
                                        onSquareClick={fetchLogsForDate}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Clique em um dia para navegar para aquela semana.
                                    </p>
                                </div>

                                {/* Right: Weekly Plan */}
                                <AdminStudentWeeklyPlan userId={user.id} selectedDate={selectedDate} />
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
