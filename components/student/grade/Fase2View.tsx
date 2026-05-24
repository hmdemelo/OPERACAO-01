'use client'

import { useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface TopicBlock {
    id: string
    customText: string | null
    completed: boolean
    f2Bool1: boolean
    f2Bool2: boolean
    f2Bool3: boolean
    f2Bool4: boolean
    f2Bool5: boolean
    topicV2: { id: string; title: string }
}

interface ContentBlock {
    id: string
    contentV2: { id: string; name: string }
    topicBlocks: TopicBlock[]
}

interface Block {
    id: string
    subjectV2: { id: string; name: string }
    contentBlocks: ContentBlock[]
}

type BoolKey = "f2Bool1" | "f2Bool2" | "f2Bool3" | "f2Bool4" | "f2Bool5"
const BOOL_KEYS: BoolKey[] = ["f2Bool1", "f2Bool2", "f2Bool3", "f2Bool4", "f2Bool5"]

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

export function Fase2View({ initialBlocks }: { initialBlocks: Block[] }) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

    function toggleBool(topicBlockId: string, key: BoolKey, value: boolean) {
        const prev = blocks
        setBlocks((bs) =>
            bs.map((b) => ({
                ...b,
                contentBlocks: b.contentBlocks.map((c) => ({
                    ...c,
                    topicBlocks: c.topicBlocks.map((t) =>
                        t.id === topicBlockId ? { ...t, [key]: value } : t
                    ),
                })),
            }))
        )
        fetch(`/api/student/grade/topic-blocks/${topicBlockId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [key]: value }),
        })
            .then((res) => {
                if (!res.ok) throw new Error()
            })
            .catch(() => {
                setBlocks(prev)
                toast.error("Erro ao salvar.")
            })
    }

    if (blocks.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-10 text-center">
                Marque assuntos como concluídos na Fase 1 para que apareçam aqui.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {blocks.map((block) => (
                <Card key={block.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">{block.subjectV2.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {block.contentBlocks.map((content) => (
                            <div key={content.id} className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    {content.contentV2.name}
                                </h4>
                                <div className="space-y-3 pl-3">
                                    {content.topicBlocks.map((topic) => (
                                        <div key={topic.id} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                                            <p className="text-sm font-medium">{topic.topicV2.title}</p>
                                            {topic.customText && <LinkedText>{topic.customText}</LinkedText>}
                                            <div className="flex flex-wrap items-center gap-4">
                                                {BOOL_KEYS.map((key, i) => (
                                                    <label key={key} className="flex items-center gap-1.5 text-sm">
                                                        <Checkbox
                                                            checked={topic[key]}
                                                            onCheckedChange={(v) => toggleBool(topic.id, key, Boolean(v))}
                                                        />
                                                        <span className="text-muted-foreground">{i + 1}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
