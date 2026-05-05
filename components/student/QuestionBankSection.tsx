"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, Lightbulb, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

type Question = {
    id: string
    externalCode: number
    stem: string
    alternatives: Record<string, string>
    correctAnswer: string | null
    commentary: string | null
    source: string | null
    year: number | null
    subject: { id: string; name: string } | null
    content: { id: string; name: string } | null
    answered: boolean
}

// Heuristic: only show source if it doesn't look like an uploaded filename.
function shouldShowSource(source: string | null): boolean {
    if (!source) return false
    const lower = source.toLowerCase()
    if (/\.(pdf|jpe?g|png|webp|gif)$/i.test(lower)) return false
    if (lower.includes("/") || lower.includes("\\")) return false
    return true
}

function QuestionCard({ question }: { question: Question }) {
    const queryClient = useQueryClient()
    const [showAnswer, setShowAnswer] = useState(false)
    const [answered, setAnswered] = useState(question.answered)
    const [isToggling, setIsToggling] = useState(false)

    const toggleAnswered = async (next: boolean) => {
        setIsToggling(true)
        const previous = answered
        setAnswered(next)
        try {
            const res = await fetch(`/api/student/questions/${question.id}/answered`, {
                method: next ? "POST" : "DELETE",
            })
            if (!res.ok) throw new Error("Falha ao atualizar")
            queryClient.invalidateQueries({ queryKey: ["studentQuestions"] })
            toast.success(next ? "Marcada como respondida" : "Desmarcada como respondida")
        } catch (err) {
            setAnswered(previous)
            toast.error(err instanceof Error ? err.message : "Erro ao atualizar")
        } finally {
            setIsToggling(false)
        }
    }

    const showSource = shouldShowSource(question.source)

    return (
        <div className={`border rounded-lg bg-card overflow-hidden transition-opacity ${answered ? "opacity-60" : ""}`}>
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">#{question.externalCode}</span>
                    {showSource && <span>• {question.source}</span>}
                    {question.content && <span>• {question.content.name}</span>}
                </div>

                <TooltipProvider delayDuration={150}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                                <Checkbox
                                    checked={answered}
                                    onCheckedChange={(v) => toggleAnswered(!!v)}
                                    disabled={isToggling}
                                    className="h-3.5 w-3.5"
                                />
                                <span>Questão respondida</span>
                                <Info className="h-3 w-3 opacity-60" />
                            </label>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs text-xs">
                            Ao marcar, esta questão deixa de aparecer aqui. Para vê-la novamente, ative <strong>&ldquo;Exibir questões respondidas&rdquo;</strong> no seu perfil.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="p-4 space-y-3">
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{question.stem}</ReactMarkdown>
                </div>

                <div className="space-y-1.5">
                    {Object.entries(question.alternatives).filter(([, v]) => v).map(([letter, text]) => {
                        const isCorrect = showAnswer && question.correctAnswer === letter
                        return (
                            <div
                                key={letter}
                                className={`text-sm flex gap-2 rounded px-2 py-1.5 transition-colors ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "border border-transparent"}`}
                            >
                                <span className="font-bold flex-shrink-0">{letter})</span>
                                <span className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                                    <ReactMarkdown>{text}</ReactMarkdown>
                                </span>
                                {isCorrect && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </div>

                {showAnswer && question.commentary && (
                    <div className="border-l-4 border-primary/50 bg-primary/5 px-3 py-2 rounded-r">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="h-3.5 w-3.5 text-primary" />
                            <p className="text-xs font-bold text-primary">COMENTÁRIO</p>
                        </div>
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{question.commentary}</ReactMarkdown>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant={showAnswer ? "outline" : "default"}
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="gap-2"
                    >
                        {showAnswer ? (
                            <>
                                <EyeOff className="h-3 w-3" /> Ocultar resposta
                            </>
                        ) : (
                            <>
                                <Eye className="h-3 w-3" /> Ver resposta
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function QuestionBankSection() {
    const { data, isLoading } = useQuery({
        queryKey: ["studentQuestions"],
        queryFn: async () => {
            const res = await fetch("/api/student/questions")
            if (!res.ok) throw new Error("Failed to fetch questions")
            return res.json() as Promise<{ questions: Question[]; showAnsweredQuestions: boolean }>
        },
        staleTime: 1000 * 60 * 5,
    })

    const questions = data?.questions || []
    const showAnswered = data?.showAnsweredQuestions ?? false

    const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
        const name = q.subject?.name || "Sem disciplina"
        if (!acc[name]) acc[name] = []
        acc[name].push(q)
        return acc
    }, {})

    return (
        <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 border-b pb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Banco de Questões da Semana</h2>
                {questions.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                        {questions.length} {questions.length === 1 ? "questão" : "questões"}
                        {showAnswered && " (incluindo respondidas)"}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : questions.length === 0 ? (
                <div className="border rounded-lg bg-card p-8 text-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                        {showAnswered
                            ? "Nenhuma questão disponível para as disciplinas desta semana."
                            : "Nenhuma questão pendente para esta semana."}
                    </p>
                    {!showAnswered && (
                        <p className="text-xs mt-1 opacity-70">
                            Ative &ldquo;Exibir questões respondidas&rdquo; no perfil para ver as já respondidas.
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([subjectName, subjectQuestions]) => (
                        <div key={subjectName} className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary uppercase text-xs tracking-wide">
                                    {subjectName}
                                </span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {subjectQuestions.length} {subjectQuestions.length === 1 ? "questão" : "questões"}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {subjectQuestions.map((q) => (
                                    <QuestionCard key={q.id} question={q} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
