"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Loader2, Clock, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type QuestionStatus = "PENDING" | "APPROVED" | "REJECTED"

export type ReviewQuestion = {
    id: string
    externalCode: number
    status: QuestionStatus
    stem: string
    alternatives: Record<string, string>
    correctAnswer: string | null
    commentary: string | null
    source: string | null
    year: number | null
    subjectId: string | null
    contentId: string | null
    subject: { id: string; name: string } | null
    content: { id: string; name: string } | null
    uploadedBy: {
        id: string
        name: string
        role?: string
        studentLink?: { mentorId: string } | null
    }
    createdAt: string
}

export function QuestionReviewCard({
    question,
    subjects,
    contents,
    onChanged,
    canApprove = true,
}: {
    question: ReviewQuestion
    subjects: { id: string; name: string }[]
    contents: { id: string; name: string; subjectId: string }[]
    onChanged: () => void
    canApprove?: boolean
}) {
    const [subjectId, setSubjectId] = useState(question.subjectId || "")
    const [contentId, setContentId] = useState(question.contentId || "")
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    const isPending = question.status === "PENDING"
    const filteredContents = contents.filter((c) => !subjectId || c.subjectId === subjectId)

    const handleApprove = async () => {
        setIsApproving(true)
        try {
            const res = await fetch(`/api/admin/questions/${question.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjectId: subjectId || null,
                    contentId: contentId || null,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Falha ao aprovar")
            toast.success(`Questão #${question.externalCode} aprovada`)
            onChanged()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao aprovar")
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        setIsRejecting(true)
        try {
            const res = await fetch(`/api/admin/questions/${question.id}/reject`, { method: "POST" })
            if (!res.ok) throw new Error("Falha ao rejeitar")
            toast.success(`Questão #${question.externalCode} rejeitada`)
            onChanged()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao rejeitar")
        } finally {
            setIsRejecting(false)
        }
    }

    const statusBadge = () => {
        if (question.status === "APPROVED") {
            return <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded">APROVADA</span>
        }
        if (question.status === "REJECTED") {
            return <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">REJEITADA</span>
        }
        return <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">PENDENTE</span>
    }

    return (
        <div className="border rounded-lg bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold font-mono">#{question.externalCode}</span>
                    {statusBadge()}
                    {question.source && <span className="text-xs text-muted-foreground">{question.source}</span>}
                    {question.uploadedBy?.name && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <User className="h-3 w-3" /> {question.uploadedBy.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(question.createdAt).toLocaleDateString("pt-BR")}
                </div>
            </div>

            <div className="p-4 space-y-3">
                <p className="text-sm whitespace-pre-wrap">{question.stem}</p>

                <div className="space-y-1.5">
                    {Object.entries(question.alternatives).filter(([, v]) => v).map(([letter, text]) => (
                        <div
                            key={letter}
                            className={`text-sm flex gap-2 rounded px-2 py-1 ${question.correctAnswer === letter ? "bg-green-500/10 border border-green-500/30" : ""}`}
                        >
                            <span className="font-bold flex-shrink-0">{letter})</span>
                            <span className="whitespace-pre-wrap">{text}</span>
                            {question.correctAnswer === letter && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {question.commentary && (
                    <div className="border-l-4 border-primary/50 bg-primary/5 px-3 py-2 rounded-r">
                        <p className="text-xs font-bold text-primary mb-1">COMENTÁRIO</p>
                        <p className="text-sm whitespace-pre-wrap">{question.commentary}</p>
                    </div>
                )}

                {isPending && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Disciplina</label>
                            <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setContentId("") }}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Conteúdo</label>
                            <Select value={contentId} onValueChange={setContentId} disabled={!subjectId}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder={subjectId ? "Selecione..." : "Escolha disciplina primeiro"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredContents.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {!isPending && (
                    <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                        {question.subject && <span>📚 {question.subject.name}</span>}
                        {question.content && <span>📖 {question.content.name}</span>}
                    </div>
                )}
            </div>

            {isPending && canApprove && (
                <div className="px-4 py-3 border-t bg-muted/20 flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReject}
                        disabled={isApproving || isRejecting}
                        className="gap-2"
                    >
                        {isRejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        Rejeitar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={isApproving || isRejecting}
                        className="gap-2"
                    >
                        {isApproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Aprovar com IA
                    </Button>
                </div>
            )}

            {isPending && !canApprove && (
                <div className="px-4 py-3 border-t bg-amber-500/5 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Apenas o mentor responsável pelo aluno pode revisar esta questão.</span>
                </div>
            )}
        </div>
    )
}
