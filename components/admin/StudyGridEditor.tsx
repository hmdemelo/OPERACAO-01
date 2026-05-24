'use client'

import { useState } from "react"
import { toast } from "sonner"
import {
    Loader2,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TopicBlock {
    id: string
    topicV2Id: string
    customText: string | null
    order: number
    visible: boolean
    topicV2: { id: string; title: string; defaultText: string | null }
}

interface ContentBlock {
    id: string
    contentV2Id: string
    order: number
    visible: boolean
    contentV2: { id: string; name: string }
    topicBlocks: TopicBlock[]
}

interface Block {
    id: string
    subjectV2Id: string
    order: number
    visible: boolean
    subjectV2: { id: string; name: string }
    contentBlocks: ContentBlock[]
}

interface Props {
    studentId: string
    studentName: string
    subjects: { id: string; name: string }[]
    initialBlocks: Block[]
}

export function StudyGridEditor({ studentId, studentName, subjects, initialBlocks }: Props) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
    const [newSubjectId, setNewSubjectId] = useState<string>("")
    const [adding, setAdding] = useState(false)
    const [busy, setBusy] = useState<string | null>(null)
    const [syncing, setSyncing] = useState<string | null>(null)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    function toggleExpand(id: string) {
        setExpanded((e) => ({ ...e, [id]: !e[id] }))
    }

    // ---------- BLOCK ----------
    async function addBlock() {
        if (!newSubjectId) {
            toast.error("Selecione uma disciplina")
            return
        }
        setAdding(true)
        try {
            const res = await fetch(`/api/admin/grade/${studentId}/blocks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectV2Id: newSubjectId }),
            })
            if (!res.ok) throw new Error(await res.text())
            const block: Block = await res.json()
            setBlocks((prev) => [...prev, { ...block, contentBlocks: block.contentBlocks ?? [] }])
            setExpanded((e) => ({ ...e, [block.id]: true }))
            setNewSubjectId("")
            toast.success("Disciplina adicionada — conteúdos clonados do catálogo V2")
        } catch (e) {
            toast.error(e instanceof Error && e.message ? e.message : "Erro ao adicionar bloco")
        } finally {
            setAdding(false)
        }
    }

    async function deleteBlock(blockId: string) {
        if (!confirm("Excluir esta disciplina da grade do aluno?")) return
        setBusy(blockId)
        try {
            const res = await fetch(`/api/admin/grade/blocks/${blockId}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setBlocks((prev) => prev.filter((b) => b.id !== blockId))
        } catch {
            toast.error("Erro ao excluir")
        } finally {
            setBusy(null)
        }
    }

    async function syncBlock(blockId: string) {
        setSyncing(blockId)
        try {
            const res = await fetch(`/api/admin/grade/blocks/${blockId}/sync`, { method: "POST" })
            if (!res.ok) throw new Error(await res.text())
            const { block, summary } = (await res.json()) as {
                block: Block
                summary: { newContents: number; newTopics: number; updatedTexts: number }
            }
            setBlocks((prev) => prev.map((b) => (b.id === blockId ? block : b)))
            const { newContents, newTopics, updatedTexts } = summary
            if (newContents === 0 && newTopics === 0 && updatedTexts === 0) {
                toast.success("Já está sincronizado com o catálogo V2")
            } else {
                const parts: string[] = []
                if (newContents > 0) parts.push(`${newContents} conteúdo${newContents !== 1 ? "s" : ""} novo${newContents !== 1 ? "s" : ""}`)
                if (newTopics > 0) parts.push(`${newTopics} assunto${newTopics !== 1 ? "s" : ""} novo${newTopics !== 1 ? "s" : ""}`)
                if (updatedTexts > 0) parts.push(`${updatedTexts} texto${updatedTexts !== 1 ? "s" : ""} atualizado${updatedTexts !== 1 ? "s" : ""}`)
                toast.success(`Sincronizado: ${parts.join(", ")}`)
            }
        } catch (e) {
            toast.error(e instanceof Error && e.message ? e.message : "Erro ao sincronizar")
        } finally {
            setSyncing(null)
        }
    }

    async function moveBlock(index: number, dir: -1 | 1) {
        const target = index + dir
        if (target < 0 || target >= blocks.length) return
        const reordered = [...blocks]
        const [a, b] = [reordered[index], reordered[target]]
        reordered[index] = b
        reordered[target] = a
        const withOrder = reordered.map((blk, i) => ({ ...blk, order: i }))
        setBlocks(withOrder)
        try {
            await Promise.all([
                fetch(`/api/admin/grade/blocks/${a.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order: withOrder.find((x) => x.id === a.id)!.order }),
                }),
                fetch(`/api/admin/grade/blocks/${b.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order: withOrder.find((x) => x.id === b.id)!.order }),
                }),
            ])
        } catch {
            toast.error("Erro ao reordenar")
        }
    }

    async function toggleBlockVisible(blockId: string, visible: boolean) {
        const snapshot = blocks
        setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, visible } : b)))
        try {
            const res = await fetch(`/api/admin/grade/blocks/${blockId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visible }),
            })
            if (!res.ok) throw new Error()
        } catch {
            setBlocks(snapshot)
            toast.error("Erro ao atualizar visibilidade")
        }
    }

    // ---------- CONTENT BLOCK ----------
    async function toggleContentVisible(blockId: string, contentBlockId: string, visible: boolean) {
        const snapshot = blocks
        setBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId
                    ? {
                        ...b,
                        contentBlocks: b.contentBlocks.map((c) =>
                            c.id === contentBlockId ? { ...c, visible } : c
                        ),
                    }
                    : b
            )
        )
        try {
            const res = await fetch(`/api/admin/grade/content-blocks/${contentBlockId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visible }),
            })
            if (!res.ok) throw new Error()
        } catch {
            setBlocks(snapshot)
            toast.error("Erro ao atualizar visibilidade")
        }
    }

    // ---------- TOPIC BLOCK ----------
    async function toggleTopicVisible(
        blockId: string,
        contentBlockId: string,
        topicBlockId: string,
        visible: boolean
    ) {
        const snapshot = blocks
        setBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId
                    ? {
                        ...b,
                        contentBlocks: b.contentBlocks.map((c) =>
                            c.id === contentBlockId
                                ? {
                                    ...c,
                                    topicBlocks: c.topicBlocks.map((t) =>
                                        t.id === topicBlockId ? { ...t, visible } : t
                                    ),
                                }
                                : c
                        ),
                    }
                    : b
            )
        )
        try {
            const res = await fetch(`/api/admin/grade/topic-blocks/${topicBlockId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visible }),
            })
            if (!res.ok) throw new Error()
        } catch {
            setBlocks(snapshot)
            toast.error("Erro ao atualizar visibilidade")
        }
    }

    async function saveTopicCustomText(topicBlockId: string, customText: string, original: string | null) {
        if (customText.trim() === (original ?? "")) return
        try {
            const res = await fetch(`/api/admin/grade/topic-blocks/${topicBlockId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customText: customText.trim() || null }),
            })
            if (!res.ok) throw new Error()
            setBlocks((prev) =>
                prev.map((b) => ({
                    ...b,
                    contentBlocks: b.contentBlocks.map((c) => ({
                        ...c,
                        topicBlocks: c.topicBlocks.map((t) =>
                            t.id === topicBlockId ? { ...t, customText: customText.trim() || null } : t
                        ),
                    })),
                }))
            )
        } catch {
            toast.error("Erro ao salvar texto")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Grade de Estudos</h1>
                <p className="text-muted-foreground">Aluno: {studentName}</p>
            </div>

            <Card>
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1.5 block">
                            Adicionar disciplina (do catálogo V2)
                        </label>
                        <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={addBlock} disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Adicionar
                    </Button>
                </CardContent>
            </Card>

            {blocks.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    Nenhuma disciplina nesta grade ainda. Adicione uma acima.
                </p>
            )}

            {blocks.map((block, index) => (
                <Card key={block.id} className={block.visible ? "" : "opacity-60"}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => toggleExpand(block.id)}
                            >
                                {expanded[block.id] ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {block.subjectV2.name}
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({block.contentBlocks.length} conteúdo{block.contentBlocks.length !== 1 ? "s" : ""})
                                </span>
                                {!block.visible && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        Oculto
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                {block.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                <span>Visível ao aluno</span>
                                <Switch
                                    checked={block.visible}
                                    onCheckedChange={(v) => toggleBlockVisible(block.id, v)}
                                />
                            </label>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => syncBlock(block.id)}
                                    disabled={syncing === block.id}
                                    title="Sincronizar com catálogo V2"
                                >
                                    {syncing === block.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => moveBlock(index, -1)}
                                    disabled={index === 0}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => moveBlock(index, 1)}
                                    disabled={index === blocks.length - 1}
                                >
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => deleteBlock(block.id)}
                                    disabled={busy === block.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {expanded[block.id] && (
                        <CardContent className="space-y-3 border-t pt-4">
                            {block.contentBlocks.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Esta disciplina não tem conteúdos no catálogo V2.
                                </p>
                            )}
                            {block.contentBlocks.map((content) => (
                                <div
                                    key={content.id}
                                    className={`border border-border/50 rounded-md p-3 space-y-2 bg-muted/20 ${
                                        content.visible ? "" : "opacity-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() => toggleExpand(content.id)}
                                            >
                                                {expanded[content.id] ? (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                {content.contentV2.name}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    ({content.topicBlocks.length} assunto{content.topicBlocks.length !== 1 ? "s" : ""})
                                                </span>
                                            </span>
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                            {content.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                            <Switch
                                                checked={content.visible}
                                                onCheckedChange={(v) => toggleContentVisible(block.id, content.id, v)}
                                            />
                                        </label>
                                    </div>

                                    {expanded[content.id] && (
                                        <div className="pl-8 space-y-2 pt-1">
                                            {content.topicBlocks.length === 0 && (
                                                <p className="text-xs text-muted-foreground py-2">
                                                    Sem assuntos no catálogo. Adicione em /admin/v2/catalogo.
                                                </p>
                                            )}
                                            {content.topicBlocks.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className={`border border-border/30 rounded p-2 bg-background/60 space-y-1 ${
                                                        topic.visible ? "" : "opacity-50"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium flex-1">{topic.topicV2.title}</p>
                                                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                                            {topic.visible ? (
                                                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                            ) : (
                                                                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}
                                                            <Switch
                                                                checked={topic.visible}
                                                                onCheckedChange={(v) =>
                                                                    toggleTopicVisible(block.id, content.id, topic.id, v)
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                    <Textarea
                                                        defaultValue={topic.customText ?? ""}
                                                        maxLength={255}
                                                        rows={2}
                                                        placeholder="Texto personalizado para este aluno (máx. 255 chars, URLs viram links)"
                                                        className="text-sm"
                                                        onBlur={(e) =>
                                                            saveTopicCustomText(topic.id, e.target.value, topic.customText)
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    )
}
