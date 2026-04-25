"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

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
}

function QuestionCard({ question }: { question: Question }) {
    const [showAnswer, setShowAnswer] = useState(false)

    return (
        <div className="border rounded-lg bg-card overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{question.externalCode}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {question.source && <span>{question.source}</span>}
                    {question.content && <span>• {question.content.name}</span>}
                </div>
            </div>

            <div className="p-4 space-y-3">
                <p className="text-sm whitespace-pre-wrap">{question.stem}</p>

                <div className="space-y-1.5">
                    {Object.entries(question.alternatives).filter(([, v]) => v).map(([letter, text]) => {
                        const isCorrect = showAnswer && question.correctAnswer === letter
                        return (
                            <div
                                key={letter}
                                className={`text-sm flex gap-2 rounded px-2 py-1.5 transition-colors ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "border border-transparent"}`}
                            >
                                <span className="font-bold flex-shrink-0">{letter})</span>
                                <span className="whitespace-pre-wrap">{text}</span>
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
                        <p className="text-sm whitespace-pre-wrap">{question.commentary}</p>
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
            return res.json() as Promise<{ questions: Question[] }>
        },
        staleTime: 1000 * 60 * 5,
    })

    const questions = data?.questions || []

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
                    <p className="text-sm">Nenhuma questão disponível para as disciplinas desta semana.</p>
                    <p className="text-xs mt-1 opacity-70">Use o botão flutuante para enviar questões.</p>
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
