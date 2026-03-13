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
    return text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:invert">
                    {part}
                </a>
            );
        }
        return part;
    });
}

const fetchWeeklyPlan = async (userId: string, date: Date): Promise<WeeklyPlan | null> => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const res = await fetch(`/api/admin/plans?userId=${userId}&date=${dateStr}`)
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch plan')
    }
    return res.json()
}

export function AdminStudentWeeklyPlan({ userId, selectedDate }: { userId: string, selectedDate: Date }) {
    const [currentDate, setCurrentDate] = useState<Date>(selectedDate)

    // Sync with parent when heatmap is clicked
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
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro ao carregar o cronograma.</div>
    }

    const weekNavigation = (
        <div className="flex items-center justify-center gap-4 py-3 mb-4">
            <button
                onClick={goToPreviousWeek}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Semana anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground select-none">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="capitalize">
                    {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "dd 'de' MMMM", { locale: ptBR })}
                </span>
            </div>
            <button
                onClick={goToNextWeek}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Próxima semana"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )

    if (!plan) {
        return (
            <div className="space-y-4">
                {weekNavigation}
                <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50 dark:bg-muted/10">
                    Nenhum cronograma (Plano Semanal) encontrado para esta semana.
                </div>
            </div>
        )
    }

    const startDate = parseFromDatabase(plan.startDate)
    const totalItems = plan.items.length
    const completedItems = plan.items.filter((i: PlanItem) => i.completed).length
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const days = [0, 1, 2, 3, 4, 5, 6]

    return (
        <div className="space-y-6 pt-2">
            {weekNavigation}

            <div className="bg-card p-4 rounded-lg border space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{Math.round(progress)}% Concluído</span>
                    <span>{completedItems} de {totalItems} blocos</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="space-y-8">
                {days.map(day => {
                    const dayItems = plan.items
                        .filter((i: PlanItem) => i.dayOfWeek === day)
                        .sort((a: PlanItem, b: PlanItem) => a.blockIndex - b.blockIndex)

                    if (dayItems.length === 0) return null

                    const currentDayDate = addDays(startDate, day)
                    const isToday = format(currentDayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                    return (
                        <div key={day} className="space-y-3 relative">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                <span className="capitalize">{format(currentDayDate, "EEEE", { locale: ptBR })}</span>
                                <span className="text-sm font-normal text-muted-foreground">{format(currentDayDate, "dd/MM")}</span>
                                {isToday && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Hoje</span>}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dayItems.map((item: PlanItem) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${item.completed
                                            ? 'bg-secondary/50 border-border'
                                            : 'bg-card border-l-4 border-l-primary/50'
                                            }`}
                                    >
                                        <div className={`mt-1 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-muted-foreground opacity-50'}`}>
                                            {item.completed ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Circle className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                {item.subject ? (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wide">
                                                        {item.subject.name}
                                                    </span>
                                                ) : null}
                                                <span className="text-xs text-muted-foreground font-medium">Bloco {item.blockIndex}</span>
                                            </div>
                                            <p className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                                                {item.content || "Sem descrição"}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 italic font-medium line-clamp-2">
                                                    {renderLinks(item.notes)}
                                                </p>
                                            )}
                                            {item.durationMinutes && (
                                                <p className="text-xs text-muted-foreground mt-1 text-primary/80 font-medium flex items-center gap-1">
                                                    ⏳ {item.durationMinutes} min
                                                </p>
                                            )}
                                            {item.questionsDone !== null && item.questionsDone !== undefined && (
                                                <p className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 inline-block px-2 py-0.5 rounded mt-1">
                                                    ✓ {item.correctCount}/{item.questionsDone} Acertos
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
        </div>
    )
}
