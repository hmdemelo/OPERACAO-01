'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subWeeks, addWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAraguainaStartOfWeek, parseFromDatabase } from '@/lib/date-utils'

interface PlanItem {
    id: string;
    dayOfWeek: number;
    blockIndex: number;
    subjectId: string | null;
    subject?: { name: string };
    content: string | null;
    notes?: string | null;
    durationMinutes: number | null;
    completed: boolean;
    questionsDone?: number | null;
    correctCount?: number | null;
}

interface WeeklyPlan {
    id: string;
    startDate: string;
    items: PlanItem[];
}

function renderLinks(text: string) {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).flatMap((part, i) => {
        if (part.match(urlRegex)) {
            return [<a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:invert">{part}</a>];
        }
        return part.split('\n').flatMap((line, j, arr) =>
            j < arr.length - 1 ? [line, <br key={`${i}-${j}`} />] : [line]
        );
    });
}

const fetchWeeklyPlan = async (userId: string, date: Date): Promise<WeeklyPlan | null> => {
    const dateStr = date.toISOString()
    const res = await fetch(`/api/admin/plans?userId=${userId}&date=${dateStr}`)
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch plan')
    }
    return res.json()
}

export function AdminStudentWeeklyPlan({ userId, selectedDate }: { userId: string, selectedDate: Date }) {
    const [currentDate, setCurrentDate] = useState<Date>(selectedDate)

    useEffect(() => {
        setCurrentDate(selectedDate)
    }, [selectedDate])

    const weekStart = getAraguainaStartOfWeek(currentDate)
    const weekEnd = addDays(weekStart, 6)

    const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1))
    const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1))

    const { data: plan, isLoading: loading, error } = useQuery({
        queryKey: ['adminWeeklyPlan', userId, format(weekStart, 'yyyy-MM-dd')],
        queryFn: () => fetchWeeklyPlan(userId, weekStart),
        staleTime: 1000 * 60 * 5,
    })

    if (loading) {
        return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary" /></div>
    }

    if (error) {
        return <div className="text-center p-6 text-red-500 text-sm">Erro ao carregar o cronograma.</div>
    }

    const totalItems = plan?.items.length ?? 0
    const completedItems = plan?.items.filter((i: PlanItem) => i.completed).length ?? 0
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const startDate = plan ? parseFromDatabase(plan.startDate) : weekStart
    const days = [0, 1, 2, 3, 4, 5, 6]

    return (
        <div className="space-y-3">
            {/* Compact header: navigation + progress inline */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-card">
                <button
                    onClick={goToPreviousWeek}
                    className="p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                    aria-label="Semana anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground select-none flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="capitalize">
                        {format(weekStart, "dd 'de' MMM", { locale: ptBR })} – {format(weekEnd, "dd 'de' MMM", { locale: ptBR })}
                    </span>
                </div>
                <button
                    onClick={goToNextWeek}
                    className="p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                    aria-label="Próxima semana"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {plan && (
                    <>
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden ml-1">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {Math.round(progress)}% · {completedItems}/{totalItems}
                        </span>
                    </>
                )}
            </div>

            {!plan ? (
                <div className="text-center p-6 text-muted-foreground border rounded-lg bg-muted/10 text-sm">
                    Nenhum cronograma encontrado para esta semana.
                </div>
            ) : (
                <div className="space-y-4">
                    {days.map(day => {
                        const dayItems = plan.items
                            .filter((i: PlanItem) => i.dayOfWeek === day)
                            .sort((a: PlanItem, b: PlanItem) => a.blockIndex - b.blockIndex)

                        if (dayItems.length === 0) return null

                        const currentDayDate = addDays(startDate, day)
                        const isToday = format(currentDayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                        return (
                            <div key={day} className="space-y-2">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <span className="capitalize">{format(currentDayDate, "EEEE", { locale: ptBR })}</span>
                                    <span className="text-xs font-normal text-muted-foreground">{format(currentDayDate, "dd/MM")}</span>
                                    {isToday && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            Hoje
                                        </span>
                                    )}
                                </h3>

                                <div className="grid grid-cols-1 gap-2">
                                    {dayItems.map((item: PlanItem) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.completed
                                                ? 'bg-secondary/50 border-border'
                                                : 'bg-card border-l-4 border-l-primary/50'
                                                }`}
                                        >
                                            <div className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-muted-foreground opacity-50'}`}>
                                                {item.completed
                                                    ? <CheckCircle2 className="w-4 h-4" />
                                                    : <Circle className="w-4 h-4" />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        {item.subject && (
                                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wide truncate">
                                                                {item.subject.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.durationMinutes && (
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            ⏳ {item.durationMinutes}min
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs mt-0.5 ${item.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                                                    {item.content || "Sem descrição"}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 italic break-words">
                                                        {renderLinks(item.notes)}
                                                    </p>
                                                )}
                                                {item.questionsDone != null && (
                                                    <p className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 inline-block px-1.5 py-0.5 rounded mt-1">
                                                        ✓ {item.correctCount}/{item.questionsDone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
