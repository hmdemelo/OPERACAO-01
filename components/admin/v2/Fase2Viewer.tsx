"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const BOOL_KEYS = ["f2Bool1", "f2Bool2", "f2Bool3", "f2Bool4", "f2Bool5"] as const
type BoolKey = typeof BOOL_KEYS[number]

interface TopicBlock {
    id: string
    topicV2: { title: string }
    f2Bool1: boolean
    f2Bool2: boolean
    f2Bool3: boolean
    f2Bool4: boolean
    f2Bool5: boolean
}

interface ContentBlock {
    id: string
    contentV2: { name: string }
    topicBlocks: TopicBlock[]
}

interface Block {
    id: string
    subjectV2: { name: string }
    contentBlocks: ContentBlock[]
}

function statusLabel(topic: TopicBlock): { label: string; className: string } {
    const done = BOOL_KEYS.filter((k) => topic[k as BoolKey]).length
    if (done === 0) return { label: "pendente", className: "text-muted-foreground" }
    if (done === 5) return { label: "✓ completo", className: "text-green-500 font-semibold" }
    const revNums = BOOL_KEYS.map((k, i) => (topic[k as BoolKey] ? `R${i + 1}` : null)).filter(Boolean).join(" ")
    return { label: revNums, className: "text-yellow-500" }
}

export function Fase2Viewer({ blocks }: { blocks: Block[] }) {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    if (blocks.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-10">
                Nenhum assunto concluído na Fase 1 ainda.
            </p>
        )
    }

    return (
        <div className="space-y-3">
            {blocks.map((block) => {
                const allTopics = block.contentBlocks.flatMap((c) => c.topicBlocks)
                const completed5 = allTopics.filter((t) => BOOL_KEYS.every((k) => t[k as BoolKey])).length
                const isCollapsed = collapsed.has(block.id)

                return (
                    <div key={block.id} className="border rounded-xl overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() =>
                                setCollapsed((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(block.id)) { next.delete(block.id) } else { next.add(block.id) }
                                    return next
                                })
                            }
                        >
                            <span className="font-semibold text-sm">{block.subjectV2.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                    {completed5}/{allTopics.length} completos
                                </span>
                                {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="p-4 space-y-4">
                                {block.contentBlocks.map((content) => (
                                    <div key={content.id} className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {content.contentV2.name}
                                        </p>
                                        <div className="space-y-1.5 pl-2">
                                            {content.topicBlocks.map((topic) => {
                                                const { label, className } = statusLabel(topic)
                                                return (
                                                    <div key={topic.id} className="flex items-center justify-between gap-3 text-sm py-1 border-b border-border/30 last:border-0">
                                                        <span className="flex-1 text-foreground/80">{topic.topicV2.title}</span>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <div className="flex gap-1">
                                                                {BOOL_KEYS.map((key) => (
                                                                    <div
                                                                        key={key}
                                                                        className={cn(
                                                                            "h-2.5 w-2.5 rounded-full border",
                                                                            topic[key as BoolKey]
                                                                                ? "bg-primary border-primary"
                                                                                : "bg-transparent border-border"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className={cn("text-xs w-20 text-right", className)}>{label}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
