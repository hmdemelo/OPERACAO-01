"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PlusCircle, Trash2, ChevronDown, ChevronUp, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SubjectRef {
    id: string
    name: string
}

interface StudyBlockRef {
    id: string
    subjectV2: SubjectRef
}

interface SimBlock {
    id: string
    studyBlockId: string
    studyBlock: StudyBlockRef
    instructions: string | null
    studentNotes: string | null
    studentResult: string | null
}

interface Simulation {
    id: string
    title: string
    date: string
    blocks: SimBlock[]
}

interface Props {
    studentId: string
    initialSimulations: Simulation[]
    availableBlocks: StudyBlockRef[]
}

function parseResult(result: string | null): number | null {
    if (!result) return null
    const m = result.match(/(\d+)\s*\/\s*(\d+)/)
    if (!m) return null
    const total = parseInt(m[2])
    if (total === 0) return null
    return Math.round((parseInt(m[1]) / total) * 100)
}

export function SimulationEditor({ studentId, initialSimulations, availableBlocks }: Props) {
    const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations)
    const [expanded, setExpanded] = useState<string | null>(simulations[0]?.id ?? null)
    const [creating, setCreating] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
    const [newBlockIds, setNewBlockIds] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [instructionDraft, setInstructionDraft] = useState<Record<string, string>>({})

    async function createSimulation() {
        if (!newTitle.trim() || newBlockIds.length === 0) {
            toast.error("Título e ao menos uma disciplina são obrigatórios.")
            return
        }
        setSaving(true)
        try {
            const res = await fetch("/api/admin/simulations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, title: newTitle.trim(), date: newDate, studyBlockIds: newBlockIds }),
            })
            if (!res.ok) throw new Error()
            const sim: Simulation = await res.json()
            setSimulations((prev) => [sim, ...prev])
            setExpanded(sim.id)
            setCreating(false)
            setNewTitle("")
            setNewBlockIds([])
            toast.success("Simulado criado.")
        } catch {
            toast.error("Erro ao criar simulado.")
        } finally {
            setSaving(false)
        }
    }

    async function deleteSimulation(id: string) {
        if (!confirm("Excluir este simulado?")) return
        try {
            const res = await fetch(`/api/admin/simulations/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setSimulations((prev) => prev.filter((s) => s.id !== id))
            toast.success("Simulado excluído.")
        } catch {
            toast.error("Erro ao excluir.")
        }
    }

    async function saveInstructions(simBlockId: string) {
        const text = instructionDraft[simBlockId] ?? ""
        try {
            const res = await fetch(`/api/admin/simulations/blocks/${simBlockId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instructions: text || null }),
            })
            if (!res.ok) throw new Error()
            setSimulations((prev) =>
                prev.map((s) => ({
                    ...s,
                    blocks: s.blocks.map((b) =>
                        b.id === simBlockId ? { ...b, instructions: text || null } : b
                    ),
                }))
            )
        } catch {
            toast.error("Erro ao salvar instruções.")
        }
    }

    async function removeBlock(simId: string, simBlockId: string) {
        try {
            const res = await fetch(`/api/admin/simulations/blocks/${simBlockId}`, { method: "DELETE" })
            if (!res.ok) throw new Error()
            setSimulations((prev) =>
                prev.map((s) =>
                    s.id === simId ? { ...s, blocks: s.blocks.filter((b) => b.id !== simBlockId) } : s
                )
            )
        } catch {
            toast.error("Erro ao remover disciplina.")
        }
    }

    async function addBlock(simId: string, studyBlockId: string) {
        try {
            const res = await fetch(`/api/admin/simulations/${simId}/blocks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studyBlockId }),
            })
            if (!res.ok) throw new Error()
            const block: SimBlock = await res.json()
            setSimulations((prev) =>
                prev.map((s) => (s.id === simId ? { ...s, blocks: [...s.blocks, block] } : s))
            )
        } catch {
            toast.error("Erro ao adicionar disciplina.")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Simulados</h2>
                    <p className="text-sm text-muted-foreground">
                        Crie simulados com instruções por disciplina. O aluno preenche o resultado.
                    </p>
                </div>
                {!creating && (
                    <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
                        <PlusCircle className="h-4 w-4" />
                        Novo Simulado
                    </Button>
                )}
            </div>

            {/* Formulário de criação */}
            {creating && (
                <div className="border rounded-xl p-4 space-y-4 bg-muted/20">
                    <p className="text-sm font-semibold">Novo simulado</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Título</label>
                            <Input
                                placeholder="ex: Simulado CESPE Maio"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                maxLength={120}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</label>
                            <Input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Disciplinas ({newBlockIds.length} selecionadas)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableBlocks.map((b) => {
                                const selected = newBlockIds.includes(b.id)
                                return (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() =>
                                            setNewBlockIds((ids) =>
                                                selected ? ids.filter((x) => x !== b.id) : [...ids, b.id]
                                            )
                                        }
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                            selected
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-border text-muted-foreground hover:border-primary/60"
                                        )}
                                    >
                                        {b.subjectV2.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" onClick={createSimulation} disabled={saving}>
                            {saving ? "Criando..." : "Criar simulado"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setCreating(false); setNewBlockIds([]) }}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {simulations.length === 0 && !creating && (
                <p className="text-sm text-muted-foreground text-center py-10">
                    Nenhum simulado criado ainda.
                </p>
            )}

            {simulations.map((sim) => {
                const isOpen = expanded === sim.id
                const dateStr = format(new Date(sim.date), "dd/MM/yyyy", { locale: ptBR })

                return (
                    <div key={sim.id} className="border rounded-xl overflow-hidden">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setExpanded(isOpen ? null : sim.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-sm">{sim.title}</span>
                                <Badge variant="outline" className="text-xs">{dateStr}</Badge>
                                <span className="text-xs text-muted-foreground">{sim.blocks.length} disciplina{sim.blocks.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteSimulation(sim.id) }}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                        </div>

                        {/* Body */}
                        {isOpen && (
                            <div className="p-4 space-y-5">
                                {sim.blocks.map((sb) => {
                                    const draft = instructionDraft[sb.id] ?? sb.instructions ?? ""
                                    const pct = parseResult(sb.studentResult)

                                    return (
                                        <div key={sb.id} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                    {sb.studyBlock.subjectV2.name}
                                                </span>
                                                <button
                                                    onClick={() => removeBlock(sim.id, sb.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <Textarea
                                                placeholder="Instruções para o aluno (suporta links e markdown)"
                                                rows={3}
                                                value={draft}
                                                onChange={(e) =>
                                                    setInstructionDraft((d) => ({ ...d, [sb.id]: e.target.value }))
                                                }
                                                onBlur={() => saveInstructions(sb.id)}
                                                className="text-sm resize-none"
                                            />

                                            {/* Preview do que o aluno vê */}
                                            {draft && (
                                                <div className="prose prose-sm dark:prose-invert max-w-none px-3 py-2 rounded-md bg-muted/30 text-xs border border-dashed border-border/60">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ ...props }) => (
                                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
                                                            ),
                                                        }}
                                                    >
                                                        {draft}
                                                    </ReactMarkdown>
                                                </div>
                                            )}

                                            {/* Resposta do aluno (leitura) */}
                                            {(sb.studentNotes || sb.studentResult) && (
                                                <div className="space-y-1 rounded-md bg-muted/20 px-3 py-2 text-sm border border-border/40">
                                                    {sb.studentResult && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">Resultado do aluno:</span>
                                                            <span className="font-semibold">{sb.studentResult}</span>
                                                            {pct !== null && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "text-xs font-bold",
                                                                        pct >= 70 ? "border-green-500 text-green-500" :
                                                                            pct >= 50 ? "border-yellow-500 text-yellow-500" :
                                                                                "border-red-500 text-red-500"
                                                                    )}
                                                                >
                                                                    {pct}%
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    {sb.studentNotes && (
                                                        <div>
                                                            <span className="text-xs text-muted-foreground">Anotações do aluno: </span>
                                                            <span className="text-sm">{sb.studentNotes}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Adicionar disciplina */}
                                {availableBlocks.filter((b) => !sim.blocks.find((sb) => sb.studyBlockId === b.id)).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adicionar disciplina</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableBlocks
                                                .filter((b) => !sim.blocks.find((sb) => sb.studyBlockId === b.id))
                                                .map((b) => (
                                                    <button
                                                        key={b.id}
                                                        type="button"
                                                        onClick={() => addBlock(sim.id, b.id)}
                                                        className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
                                                    >
                                                        + {b.subjectV2.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
