"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronUp } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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

export function Fase3View({ initialSimulations }: { initialSimulations: Simulation[] }) {
    const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations)
    const [expanded, setExpanded] = useState<string | null>(initialSimulations[0]?.id ?? null)

    function setLocal(simId: string, blockId: string, field: "studentNotes" | "studentResult", value: string) {
        setSimulations((prev) =>
            prev.map((s) =>
                s.id !== simId ? s : {
                    ...s,
                    blocks: s.blocks.map((b) =>
                        b.id === blockId ? { ...b, [field]: value } : b
                    ),
                }
            )
        )
    }

    function save(blockId: string, field: "studentNotes" | "studentResult", value: string) {
        fetch(`/api/student/simulations/blocks/${blockId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value || null }),
        }).then((res) => {
            if (!res.ok) throw new Error()
        }).catch(() => toast.error("Erro ao salvar."))
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
                    <div key={sim.id} className="border rounded-xl overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
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
                            <div className="p-4 space-y-6">
                                {sim.blocks.map((sb) => (
                                    <div key={sb.id} className="space-y-3 border-b pb-5 last:border-0 last:pb-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {sb.studyBlock.subjectV2.name}
                                        </p>

                                        {sb.instructions && (
                                            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-muted/30 px-3 py-2 border border-border/40">
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
                                                value={sb.studentNotes ?? ""}
                                                onChange={(e) => setLocal(sim.id, sb.id, "studentNotes", e.target.value)}
                                                onBlur={(e) => save(sb.id, "studentNotes", e.target.value)}
                                                className="resize-none"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">Resultado (acertos/total)</label>
                                            <Input
                                                maxLength={50}
                                                placeholder="ex: 45/60"
                                                className="max-w-[160px]"
                                                value={sb.studentResult ?? ""}
                                                onChange={(e) => setLocal(sim.id, sb.id, "studentResult", e.target.value)}
                                                onBlur={(e) => save(sb.id, "studentResult", e.target.value)}
                                            />
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
