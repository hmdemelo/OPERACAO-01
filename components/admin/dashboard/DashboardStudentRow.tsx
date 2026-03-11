"use client"

import { logger } from "@/lib/logger";
import { useState } from "react"
import { ActivityHeatmap } from "@/components/admin/users/ActivityHeatmap"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { ChevronUp, BarChart2, Loader2, Calendar } from "lucide-react"

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
    const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null)
    const [selectedWeekEnd, setSelectedWeekEnd] = useState<string | null>(null)
    const [weeklyLogs, setWeeklyLogs] = useState<any[] | null>(null)
    const [isLoadingLogs, setIsLoadingLogs] = useState(false)

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
        // Find Monday and Sunday of the selected week
        const date = new Date(`${dateStr}T12:00:00.000-03:00`)
        const day = date.getDay() // 0 is Sunday, 1 is Monday
        const diffToMonday = day === 0 ? -6 : 1 - day
        
        const monday = new Date(date)
        monday.setDate(monday.getDate() + diffToMonday)
        
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)
        
        const formatString = (d: Date) => d.toISOString().split('T')[0]
        
        const startStr = formatString(monday)
        const endStr = formatString(sunday)

        setSelectedWeekStart(startStr)
        setSelectedWeekEnd(endStr)
        setIsLoadingLogs(true)
        setWeeklyLogs(null)
        
        try {
            const res = await fetch(`/api/admin/users/${user.id}/logs?startDate=${startStr}&endDate=${endStr}`)
            if (res.ok) {
                const data = await res.json()
                setWeeklyLogs(data)
            } else {
                setWeeklyLogs([])
            }
        } catch (e) {
            logger.error(e)
            setWeeklyLogs([])
        } finally {
            setIsLoadingLogs(false)
        }
    }

    const getDaysOfWeek = () => {
        if (!selectedWeekStart) return [];
        const days = [];
        const start = new Date(`${selectedWeekStart}T12:00:00.000-03:00`);
        for (let i = 0; i < 7; i++) {
            const current = new Date(start);
            current.setDate(current.getDate() + i);
            days.push(current);
        }
        return days;
    }
    
    const getDayName = (dayIndex: number) => {
        const names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return names[dayIndex];
    }

    return (
        <>
            <TableRow className={`${isExpanded ? "bg-muted/30" : "hover:bg-muted/10"} transition-colors`}>
                <TableCell className="font-mono text-muted-foreground pl-6">#{rank}</TableCell>
                <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{user.name || "Sem nome"}</span>
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
                </TableCell>
            </TableRow>

            {/* Expanded Content: Heatmap & Inline Details */}
            {isExpanded && (
                <TableRow className="bg-muted/10 border-b">
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-6 pl-12 animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Consistência de Estudo (Últimos 60 dias)
                                </p>

                                <div className="w-full">
                                    <ActivityHeatmap
                                        data={heatmapData}
                                        days={60}
                                        compact={true}
                                        onSquareClick={fetchLogsForDate}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * Clique em um dia para ver os detalhes formatados abaixo.
                                </p>

                                {/* Inline Detail View */}
                                {selectedWeekStart && selectedWeekEnd && (
                                    <div className="mt-4 p-4 border rounded-md bg-background/50 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <h4 className="font-semibold text-sm">
                                                Semana de {new Date(`${selectedWeekStart}T12:00:00-03:00`).toLocaleDateString('pt-BR')} a {new Date(`${selectedWeekEnd}T12:00:00-03:00`).toLocaleDateString('pt-BR')}
                                            </h4>
                                        </div>

                                        {isLoadingLogs ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Carregando registros da semana...
                                            </div>
                                        ) : weeklyLogs ? (
                                            <div className="flex flex-col gap-4">
                                                {getDaysOfWeek().map(dayDate => {
                                                    const dateStrForMatch = dayDate.toISOString().split('T')[0];
                                                    const dayLogs = weeklyLogs.filter((log: any) => {
                                                        const logDateStr = new Date(log.date).toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).split(' ')[0];
                                                        return logDateStr === dateStrForMatch;
                                                    });
                                                    
                                                    return (
                                                        <div key={dateStrForMatch} className="flex flex-col gap-2">
                                                            <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                                                                {getDayName(dayDate.getDay())} - {dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                            </div>
                                                            
                                                            {dayLogs.length === 0 ? (
                                                                <div className="pl-4 py-2 border-l-2 border-muted text-xs text-muted-foreground italic">
                                                                    Sem atividade neste dia.
                                                                </div>
                                                            ) : (
                                                                <div className="grid gap-2 grid-cols-1 md:grid-cols-2 pl-4 border-l-2 border-primary/20">
                                                                    {dayLogs.map((log: any) => (
                                                                        <div key={log.id || Math.random()} className="flex flex-col justify-between gap-2 p-3 border rounded-sm bg-card shadow-sm hover:border-primary/30 transition-colors text-sm">
                                                                            <div>
                                                                                <div className="font-semibold text-primary">{log.subject?.name || "Matéria Indefinida"}</div>
                                                                                <div className="text-xs text-muted-foreground line-clamp-1" title={log.content?.name}>
                                                                                    {log.content?.name || "Sem conteúdo especificado"}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-xs font-medium border-t pt-2 mt-1">
                                                                                <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{log.hoursStudied || 0}h</span>
                                                                                <span className="text-muted-foreground flex-1">Questões: {log.questionsAnswered || 0}</span>
                                                                                <span className="text-green-600 dark:text-green-500">Acertos: {log.correctAnswers || 0}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
