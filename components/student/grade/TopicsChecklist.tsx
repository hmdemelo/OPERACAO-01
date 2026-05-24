'use client'

import { useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface Topic {
    id: string
    customText: string | null
    completed: boolean
    topicV2: { id: string; title: string }
}

function LinkedText({ children }: { children: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 break-words">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}

interface Props {
    initialTopics: Topic[]
    contentName?: string
}

export function TopicsChecklist({ initialTopics, contentName }: Props) {
    const [topics, setTopics] = useState<Topic[]>(initialTopics)

    function toggle(topicId: string, value: boolean) {
        const prev = topics
        const next = topics.map((t) => (t.id === topicId ? { ...t, completed: value } : t))
        setTopics(next)

        const allDone = next.length > 0 && next.every((t) => t.completed)
        const wasAllDone = prev.length > 0 && prev.every((t) => t.completed)

        fetch(`/api/student/grade/topic-blocks/${topicId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: value }),
        })
            .then((res) => {
                if (!res.ok) throw new Error()
                if (value && allDone && !wasAllDone) {
                    toast.success(
                        contentName
                            ? `${contentName} concluído! 🎯`
                            : "Conteúdo concluído! 🎯",
                        { duration: 4000 }
                    )
                }
            })
            .catch(() => {
                setTopics(prev)
                toast.error("Erro ao salvar.")
            })
    }

    if (topics.length === 0) {
        return <p className="text-muted-foreground text-center py-10">Sem assuntos neste conteúdo.</p>
    }

    const total = topics.length
    const done = topics.filter((t) => t.completed).length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-border/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">{done}/{total} · {pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className={cn(
                            "flex items-start gap-3 rounded-md border border-border/50 p-3 transition-all duration-200",
                            topic.completed && "opacity-60 bg-muted/30"
                        )}
                    >
                        <Checkbox
                            checked={topic.completed}
                            onCheckedChange={(v) => toggle(topic.id, Boolean(v))}
                            className="mt-0.5"
                        />
                        <div className="flex-1">
                            <p
                                className={cn(
                                    "text-sm font-medium transition-all",
                                    topic.completed && "line-through text-muted-foreground"
                                )}
                            >
                                {topic.topicV2.title}
                            </p>
                            {topic.customText && (
                                <div className={cn("mt-1 transition-all", topic.completed && "line-through opacity-70")}>
                                    <LinkedText>{topic.customText}</LinkedText>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
