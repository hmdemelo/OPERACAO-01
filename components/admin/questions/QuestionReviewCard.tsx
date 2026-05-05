"use client"

import { useRef, useState } from "react"
import { Bold, Italic, Strikethrough, Underline, CheckCircle2, XCircle, Loader2, Clock, Lock, User, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

type ToolbarAction = {
    icon: React.ReactNode
    label: string
    prefix: string
    suffix: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
    { icon: <Bold className="h-3.5 w-3.5" />, label: "Negrito", prefix: "**", suffix: "**" },
    { icon: <Italic className="h-3.5 w-3.5" />, label: "Itálico", prefix: "*", suffix: "*" },
    { icon: <Underline className="h-3.5 w-3.5" />, label: "Sublinhado", prefix: "<u>", suffix: "</u>" },
    { icon: <Strikethrough className="h-3.5 w-3.5" />, label: "Rasurado", prefix: "~~", suffix: "~~" },
]

function applyMarkdown(
    textarea: HTMLTextAreaElement,
    prefix: string,
    suffix: string,
    value: string,
    onChange: (v: string) => void,
) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)
    const before = value.slice(0, start)
    const after = value.slice(end)

    const newValue = `${before}${prefix}${selected}${suffix}${after}`
    onChange(newValue)

    requestAnimationFrame(() => {
        textarea.focus()
        const cursor = selected ? end + prefix.length + suffix.length : start + prefix.length
        textarea.setSelectionRange(cursor, cursor)
    })
}

function MarkdownToolbar({
    textareaRef,
    value,
    onChange,
}: {
    textareaRef: React.RefObject<HTMLTextAreaElement>
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div className="flex flex-col gap-1 pt-1">
            {TOOLBAR_ACTIONS.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    title={action.label}
                    onMouseDown={(e) => {
                        // prevent textarea from losing focus
                        e.preventDefault()
                        if (textareaRef.current) {
                            applyMarkdown(textareaRef.current, action.prefix, action.suffix, value, onChange)
                        }
                    }}
                    className="h-7 w-7 flex items-center justify-center rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    {action.icon}
                </button>
            ))}
        </div>
    )
}

function EditableField({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    highlight = false,
    highlightLabel,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    rows?: number
    highlight?: boolean
    highlightLabel?: React.ReactNode
}) {
    const [focused, setFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {label}
                {highlightLabel}
            </label>
            <div className="flex gap-2 items-start">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={highlight ? "border-amber-500/40 bg-amber-500/5 focus-visible:ring-amber-500/40 flex-1" : "flex-1"}
                />
                {focused && (
                    <MarkdownToolbar
                        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
                        value={value}
                        onChange={onChange}
                    />
                )}
            </div>
        </div>
    )
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
    const [stem, setStem] = useState(question.stem)
    const [subjectId, setSubjectId] = useState(question.subjectId || "")
    const [contentId, setContentId] = useState(question.contentId || "")
    const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "")
    const [commentary, setCommentary] = useState(question.commentary || "")

    const [answerFromAI, setAnswerFromAI] = useState(false)
    const [commentaryFromAI, setCommentaryFromAI] = useState(false)

    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [isSuggesting, setIsSuggesting] = useState(false)

    const isPending = question.status === "PENDING"
    const filteredContents = contents.filter((c) => !subjectId || c.subjectId === subjectId)

    const selectAnswer = (letter: string) => {
        if (!isPending) return
        setCorrectAnswer((prev) => (prev === letter ? "" : letter))
        setAnswerFromAI(false)
    }

    const handleSuggest = async () => {
        setIsSuggesting(true)
        try {
            const res = await fetch(`/api/admin/questions/${question.id}/suggest`, { method: "POST" })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Falha na sugestão")
            setCorrectAnswer(data.correctAnswer || "")
            setCommentary(data.commentary || "")
            setAnswerFromAI(true)
            setCommentaryFromAI(true)
            toast.success("Sugestão da IA aplicada — revise antes de aprovar")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao consultar IA")
        } finally {
            setIsSuggesting(false)
        }
    }

    const handleApprove = async () => {
        if (!correctAnswer) {
            toast.error("Marque a alternativa correta antes de aprovar")
            return
        }
        setIsApproving(true)
        try {
            const res = await fetch(`/api/admin/questions/${question.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stem: stem.trim() || question.stem,
                    subjectId: subjectId || null,
                    contentId: contentId || null,
                    correctAnswer,
                    commentary: commentary.trim() || null,
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

    const anyBusy = isApproving || isRejecting || isSuggesting

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
                {isPending ? (
                    <EditableField
                        label="Enunciado"
                        value={stem}
                        onChange={setStem}
                        placeholder="Enunciado da questão..."
                        rows={4}
                    />
                ) : (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{question.stem}</ReactMarkdown>
                    </div>
                )}

                <div className="space-y-1.5">
                    {Object.entries(question.alternatives).filter(([, v]) => v).map(([letter, text]) => {
                        const isCorrect = correctAnswer === letter
                        const showAsSuggestion = isCorrect && answerFromAI

                        const baseClasses = "text-sm flex gap-2 rounded px-2 py-1.5 border transition-colors"
                        let stateClasses = "border-transparent"

                        if (isCorrect && showAsSuggestion) {
                            stateClasses = "bg-amber-500/10 border-amber-500/40"
                        } else if (isCorrect) {
                            stateClasses = "bg-green-500/10 border-green-500/40"
                        } else if (isPending) {
                            stateClasses = "border-transparent hover:bg-muted/40 hover:border-border cursor-pointer"
                        }

                        return (
                            <div
                                key={letter}
                                onClick={() => selectAnswer(letter)}
                                role={isPending ? "button" : undefined}
                                className={`${baseClasses} ${stateClasses}`}
                            >
                                <span className="font-bold flex-shrink-0">{letter})</span>
                                <span className="prose prose-sm dark:prose-invert max-w-none flex-1 [&>p]:m-0">
                                    <ReactMarkdown>{text}</ReactMarkdown>
                                </span>
                                {isCorrect && (
                                    showAsSuggestion ? (
                                        <Sparkles className="h-4 w-4 text-amber-600 ml-auto flex-shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>

                {isPending ? (
                    <EditableField
                        label="Comentário"
                        value={commentary}
                        onChange={(v) => { setCommentary(v); setCommentaryFromAI(false) }}
                        placeholder="Comentário explicativo (opcional)..."
                        rows={3}
                        highlight={commentaryFromAI && !!commentary}
                        highlightLabel={
                            commentaryFromAI && commentary ? (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500">
                                    <Sparkles className="h-3 w-3" /> sugestão da IA
                                </span>
                            ) : null
                        }
                    />
                ) : (
                    question.commentary && (
                        <div className="border-l-4 border-primary/50 bg-primary/5 px-3 py-2 rounded-r">
                            <p className="text-xs font-bold text-primary mb-1">COMENTÁRIO</p>
                            <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{question.commentary}</ReactMarkdown>
                            </div>
                        </div>
                    )
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
                <div className="px-4 py-3 border-t bg-muted/20 flex flex-wrap justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReject}
                        disabled={anyBusy}
                        className="gap-2"
                    >
                        {isRejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        Rejeitar
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSuggest}
                        disabled={anyBusy}
                        className="gap-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
                    >
                        {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Auxílio de IA
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={anyBusy || !correctAnswer}
                        className="gap-2"
                    >
                        {isApproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Aprovar
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
