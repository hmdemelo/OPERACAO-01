"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronUp, Loader2, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface SimBlock {
    id: string
    instructions: string | null
    studentNotes: string | null
    studentResult: string | null
    studyBlock: { subjectV2: { name: string } }
}

interface Simulation {
    id: string
    title: string
    date: string
    blocks: SimBlock[]
}

type Draft = { studentNotes: string; studentResult: string }

export function Fase3View({ initialSimulations }: { initialSimulations: Simulation[] }) {
    const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations)
    const [expanded, setExpanded] = useState<string | null>(initialSimulations[0]?.id ?? null)
    const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
        const d: Record<string, Draft> = {}
        for (const s of initialSimulations) {
            for (const b of s.blocks) {
                d[b.id] = {
                    studentNotes: b.studentNotes ?? "",
                    studentResult: b.studentResult ?? "",
                }
            }
        }
        return d
    })
    const [savingId, setSavingId] = useState<string | null>(null)

    function getDraft(block: SimBlock): Draft {
        return drafts[block.id] ?? {
            studentNotes: block.studentNotes ?? "",
            studentResult: block.studentResult ?? "",
        }
    }

    function isDirty(block: SimBlock): boolean {
        const d = getDraft(block)
        return d.studentNotes !== (block.studentNotes ?? "") ||
            d.studentResult !== (block.studentResult ?? "")
    }

    function setDraftField(blockId: string, field: keyof Draft, value: string) {
        setDrafts((prev) => ({
            ...prev,
            [blockId]: { ...prev[blockId], [field]: value },
        }))
    }

    async function save(simId: string, block: SimBlock) {
        const draft = getDraft(block)
        setSavingId(block.id)
        try {
            const res = await fetch(`/api/student/simulations/blocks/${block.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentNotes: draft.studentNotes || null,
                    studentResult: draft.studentResult || null,
                }),
            })
            if (!res.ok) throw new Error()
            setSimulations((prev) =>
                prev.map((s) =>
                    s.id !== simId ? s : {
                        ...s,
                        blocks: s.blocks.map((b) =>
                            b.id === block.id ? {
                                ...b,
                                studentNotes: draft.studentNotes || null,
                                studentResult: draft.studentResult || null,
                            } : b
                        ),
                    }
                )
            )
            toast.success("Salvo.")
        } catch {
            toast.error("Erro ao salvar.")
        } finally {
            setSavingId(null)
        }
    }

    if (simulations.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-10">
                Nenhum simulado disponível ainda. Aguarde seu mentor.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {simulations.map((sim) => {
                const isOpen = expanded === sim.id
                const dateStr = format(new Date(sim.date), "dd/MM/yyyy", { locale: ptBR })
                const filled = sim.blocks.filter((b) => b.studentResult).length

                return (
                    <div
                        key={sim.id}
                        className="border-2 border-border/70 rounded-xl overflow-hidden bg-card shadow-sm"
                    >
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-muted/60 hover:bg-muted/80 cursor-pointer transition-colors border-b border-border/60"
                            onClick={() => setExpanded(isOpen ? null : sim.id)}
                        >
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-semibold">{sim.title}</span>
                                <span className="text-xs text-muted-foreground">{dateStr}</span>
                                {filled > 0 && (
                                    <span className="text-xs text-primary font-medium">
                                        {filled}/{sim.blocks.length} preenchidos
                                    </span>
                                )}
                            </div>
                            {isOpen
                                ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                                : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            }
                        </div>

                        {isOpen && (
                            <div className="p-4 space-y-6 bg-background/40">
                                {sim.blocks.map((sb) => {
                                    const draft = getDraft(sb)
                                    const dirty = isDirty(sb)
                                    const saving = savingId === sb.id

                                    return (
                                        <div key={sb.id} className="space-y-3 border-b border-border/50 pb-5 last:border-0 last:pb-0">
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                {sb.studyBlock.subjectV2.name}
                                            </p>

                                            {sb.instructions && (
                                                <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-muted/50 px-3 py-2 border border-border/60">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ ...props }) => (
                                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
                                                            ),
                                                        }}
                                                    >
                                                        {sb.instructions}
                                                    </ReactMarkdown>
                                                </div>
                                            )}

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground">Minhas anotações</label>
                                                <Textarea
                                                    rows={2}
                                                    maxLength={500}
                                                    placeholder="Observações sobre este simulado..."
                                                    value={draft.studentNotes}
                                                    onChange={(e) => setDraftField(sb.id, "studentNotes", e.target.value)}
                                                    className="resize-none"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground">Resultado (acertos/total)</label>
                                                <Input
                                                    maxLength={50}
                                                    placeholder="ex: 45/60"
                                                    className="max-w-[160px]"
                                                    value={draft.studentResult}
                                                    onChange={(e) => setDraftField(sb.id, "studentResult", e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => save(sim.id, sb)}
                                                    disabled={!dirty || saving}
                                                    className="gap-1.5"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                    Salvar
                                                </Button>
                                                {dirty && !saving && (
                                                    <span className="text-xs text-muted-foreground">Alterações não salvas</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
