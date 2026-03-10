'use client'

import { logger } from "@/lib/logger";
import { useState } from 'react'
import { format, addDays, addWeeks, subWeeks, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionsInputModal } from './QuestionsInputModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAraguainaStartOfWeek, parseFromDatabase } from '@/lib/date-utils'
import { useStudentStore } from '@/store/useStudentStore'

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

const fetchWeeklyPlan = async (date: Date): Promise<WeeklyPlan | null> => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const res = await fetch(`/api/student/plan?date=${dateStr}`)
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch plan')
    }
    return res.json()
}

export default function WeeklyPlanView() {
    const queryClient = useQueryClient()
    const invalidateDashboard = useStudentStore(state => state.invalidateDashboard)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null)
    const [currentDate, setCurrentDate] = useState(() => new Date())

    const weekStart = getAraguainaStartOfWeek(currentDate)
    const weekEnd = addDays(weekStart, 6)

    const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1))
    const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1))

    const { data: plan, isLoading: loading, error } = useQuery({
        queryKey: ['weeklyPlan', format(weekStart, 'yyyy-MM-dd')],
        queryFn: () => fetchWeeklyPlan(weekStart),
        staleTime: 1000 * 60 * 5,
    })

    const mutation = useMutation({
        mutationFn: async ({ itemId, currentStatus, correctCount, questionsDone }: { itemId: string, currentStatus: boolean, correctCount?: number, questionsDone?: number }) => {
            const payload: any = { completed: !currentStatus }
            if (correctCount !== undefined) payload.correctCount = correctCount
            if (questionsDone !== undefined) payload.questionsDone = questionsDone

            const res = await fetch(`/api/student/plan/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Failed to update')
            return { itemId, payload }
        },
        onMutate: async ({ itemId, currentStatus, correctCount, questionsDone }) => {
            await queryClient.cancelQueries({ queryKey: ['weeklyPlan'] })
            const previousPlan = queryClient.getQueryData<WeeklyPlan>(['weeklyPlan'])

            queryClient.setQueryData<WeeklyPlan | null>(['weeklyPlan'], old => {
                if (!old) return old
                return {
                    ...old,
                    items: old.items.map(i => i.id === itemId ? {
                        ...i,
                        completed: !currentStatus,
                        correctCount: correctCount ?? i.correctCount,
                        questionsDone: questionsDone ?? i.questionsDone
                    } : i)
                }
            })

            return { previousPlan }
        },
        onError: (err, variables, context) => {
            logger.error(err)
            toast.error('Erro ao atualizar status. Tente novamente.')
            if (context?.previousPlan) {
                queryClient.setQueryData(['weeklyPlan'], context.previousPlan)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['weeklyPlan'] })
            invalidateDashboard() // Force dashboard to refresh next time it's opened
        }
    })

    const handleToggleClick = (item: PlanItem) => {
        if (item.completed) {
            mutation.mutate({ itemId: item.id, currentStatus: item.completed })
        } else {
            const isQuestions = item.content?.includes("Questões") || item.subject?.name === "Questões";
            if (isQuestions) {
                setSelectedItem(item);
                setModalOpen(true);
            } else {
                mutation.mutate({ itemId: item.id, currentStatus: item.completed })
            }
        }
    }

    const handleModalSave = (correct: number, total: number) => {
        if (selectedItem) {
            mutation.mutate({
                itemId: selectedItem.id,
                currentStatus: false,
                correctCount: correct,
                questionsDone: total
            })
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro ao carregar o cronograma.</div>
    }

    const weekNavigation = (
        <div className="flex items-center justify-center gap-4 py-3">
            <button
                onClick={goToPreviousWeek}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Semana anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground select-none">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="capitalize">
                    {format(weekStart, "dd 'De' MMMM", { locale: ptBR })} - {format(weekEnd, "dd 'De' MMMM", { locale: ptBR })}
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
                <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50">
                    Nenhum cronograma encontrado para esta semana.
                </div>
            </div>
        )
    }

    const startDate = parseFromDatabase(plan.startDate)
    const totalItems = plan.items.length
    const completedItems = plan.items.filter(i => i.completed).length
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const days = [0, 1, 2, 3, 4, 5, 6]

    return (
        <div className="space-y-8">
            {weekNavigation}

            <div className="bg-card p-4 rounded-lg border space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{Math.round(progress)}% Concluído</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="space-y-6">
                {days.map(day => {
                    const dayItems = plan.items
                        .filter(i => i.dayOfWeek === day)
                        .sort((a, b) => a.blockIndex - b.blockIndex)

                    if (dayItems.length === 0) return null

                    const currentDate = addDays(startDate, day)

                    return (
                        <div key={day} className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                <span className="capitalize">{format(currentDate, "EEEE", { locale: ptBR })}</span>
                                <span className="text-sm font-normal text-muted-foreground">{format(currentDate, "dd/MM")}</span>
                            </h3>

                            <div className="grid gap-3">
                                {dayItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${item.completed
                                            ? 'bg-secondary/50 border-border'
                                            : 'bg-card border-primary/50 hover:border-primary'
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleToggleClick(item)}
                                            disabled={mutation.isPending && mutation.variables?.itemId === item.id}
                                            className={`mt-1 flex-shrink-0 transition-colors disabled:opacity-50 ${item.completed ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'}`}
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : (
                                                <Circle className="w-6 h-6" />
                                            )}
                                        </button>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                {item.subject ? (
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wide">
                                                        {item.subject.name}
                                                    </span>
                                                ) : null}
                                                <span className="text-xs text-muted-foreground font-medium">Block {item.blockIndex}</span>
                                            </div>
                                            <p className={`text-base ${item.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                                                {item.content || "Sem descrição"}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-amber-500 mt-1 italic font-medium">
                                                    {renderLinks(item.notes)}
                                                </p>
                                            )}
                                            {item.durationMinutes && (
                                                <p className="text-xs text-muted-foreground">{item.durationMinutes} min</p>
                                            )}
                                            {item.questionsDone !== null && item.questionsDone !== undefined && (
                                                <p className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 inline-block px-2 py-0.5 rounded mt-1">
                                                    {item.correctCount}/{item.questionsDone} Acertos
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

            <QuestionsInputModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
                itemContent={selectedItem?.content || "Questões"}
            />
        </div >
    )
}
