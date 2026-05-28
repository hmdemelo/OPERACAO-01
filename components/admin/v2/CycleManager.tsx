"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Lock, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type Cycle = {
    id: string
    cycleNumber: number
    cycleLabel: string
    active: boolean
    completedAt: string | null
    createdAt: string
    topicsDone: number
    topicsTotal: number
}

type CatalogTopic = { id: string; title: string; defaultText: string | null; studied: boolean }
type CatalogContent = { id: string; name: string; topics: CatalogTopic[] }
type CatalogSubject = { id: string; name: string; contents: CatalogContent[] }

type Props = {
    studentId: string
    cycles: Cycle[]
    nextCycleNumber: number
}

function formatDate(iso: string | null) {
    if (!iso) return "—"
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

export function CycleManager({ studentId, cycles, nextCycleNumber }: Props) {
    const router = useRouter()
    const activeCycle = cycles.find((c) => c.active) ?? null

    const [creating, setCreating] = useState(false)
    const [closing, setClosing] = useState(false)
    const [catalog, setCatalog] = useState<CatalogSubject[] | null>(null)
    const [label, setLabel] = useState("")
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const [creatingDialogOpen, setCreatingDialogOpen] = useState(false)
    const [loadingCatalog, setLoadingCatalog] = useState(false)

    async function openCreateDialog() {
        if (activeCycle) {
            toast.error(`Encerre o Ciclo ${activeCycle.cycleNumber} antes de criar um novo.`)
            return
        }
        setCreatingDialogOpen(true)
        setLabel("")
        setSelected(new Set())
        setExpanded(new Set())
        if (catalog === null) {
            setLoadingCatalog(true)
            try {
                const res = await fetch(`/api/admin/students/${studentId}/cycles?catalog=1`)
                if (!res.ok) throw new Error()
                const data = await res.json()
                setCatalog(data.catalog)
            } catch {
                toast.error("Erro ao carregar catálogo")
                setCreatingDialogOpen(false)
            } finally {
                setLoadingCatalog(false)
            }
        }
    }

    function toggleTopic(id: string) {
        const next = new Set(selected)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelected(next)
    }

    function toggleContent(content: CatalogContent) {
        const ids = content.topics.map((t) => t.id)
        const allSelected = ids.every((id) => selected.has(id))
        const next = new Set(selected)
        if (allSelected) ids.forEach((id) => next.delete(id))
        else ids.forEach((id) => next.add(id))
        setSelected(next)
    }

    function toggleExpand(id: string) {
        const next = new Set(expanded)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setExpanded(next)
    }

    async function submitCreate() {
        if (!label.trim()) {
            toast.error("Informe o nome do ciclo")
            return
        }
        if (selected.size === 0) {
            toast.error("Selecione ao menos um tópico")
            return
        }
        setCreating(true)
        try {
            const res = await fetch(`/api/admin/students/${studentId}/cycles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cycleLabel: label.trim(), topicV2Ids: [...selected] }),
            })
            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg)
            }
            toast.success(`Ciclo ${nextCycleNumber} criado`)
            setCreatingDialogOpen(false)
            router.refresh()
        } catch (e) {
            toast.error(e instanceof Error && e.message ? e.message : "Erro ao criar ciclo")
        } finally {
            setCreating(false)
        }
    }

    async function closeActive() {
        if (!activeCycle) return
        if (!confirm(`Encerrar o Ciclo ${activeCycle.cycleNumber}? Os tópicos não marcados ficarão registrados como não estudados.`)) {
            return
        }
        setClosing(true)
        try {
            const res = await fetch(`/api/admin/students/${studentId}/cycles/${activeCycle.id}/close`, {
                method: "PATCH",
            })
            if (!res.ok) throw new Error(await res.text())
            toast.success("Ciclo encerrado")
            router.refresh()
        } catch (e) {
            toast.error(e instanceof Error && e.message ? e.message : "Erro ao encerrar ciclo")
        } finally {
            setClosing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Ciclos da Fase 1</h2>
                    <p className="text-sm text-muted-foreground">
                        {activeCycle
                            ? `Ciclo ativo: ${activeCycle.cycleNumber} — ${activeCycle.cycleLabel}`
                            : "Nenhum ciclo ativo no momento."}
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeCycle && (
                        <Button variant="outline" onClick={closeActive} disabled={closing}>
                            <Lock className="h-4 w-4 mr-1.5" />
                            Encerrar ciclo
                        </Button>
                    )}
                    <Button onClick={openCreateDialog} disabled={!!activeCycle}>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Novo ciclo
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-b">
                        <tr>
                            <th className="text-left p-3 font-semibold">Ciclo</th>
                            <th className="text-left p-3 font-semibold">Nome</th>
                            <th className="text-left p-3 font-semibold">Progresso</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            <th className="text-left p-3 font-semibold">Criado</th>
                            <th className="text-left p-3 font-semibold">Encerrado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cycles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                    Nenhum ciclo criado. Use "Novo ciclo" para começar.
                                </td>
                            </tr>
                        ) : (
                            cycles.map((c) => {
                                const pct = c.topicsTotal > 0 ? Math.round((c.topicsDone / c.topicsTotal) * 100) : 0
                                return (
                                    <tr key={c.id} className="border-b last:border-0">
                                        <td className="p-3 font-bold">{c.cycleNumber}</td>
                                        <td className="p-3">{c.cycleLabel}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-24 rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs tabular-nums text-muted-foreground">
                                                    {c.topicsDone}/{c.topicsTotal}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {c.active ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500">
                                                    <span className="h-2 w-2 rounded-full bg-orange-500" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <CheckCircle2 className="h-3 w-3" /> Encerrado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                                        <td className="p-3 text-muted-foreground">{formatDate(c.completedAt)}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={creatingDialogOpen} onOpenChange={setCreatingDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Criar Ciclo {nextCycleNumber}</DialogTitle>
                        <DialogDescription>
                            Selecione os conteúdos do novo ciclo. Tópicos já estudados em ciclos anteriores
                            aparecem marcados como tal — você ainda pode incluí-los novamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="cycleLabel">Nome do ciclo</Label>
                            <Input
                                id="cycleLabel"
                                placeholder="Ex: Base, Intermediário, Revisão final"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                maxLength={60}
                            />
                        </div>

                        <div className="border rounded-lg divide-y">
                            {loadingCatalog ? (
                                <p className="p-6 text-center text-sm text-muted-foreground">Carregando catálogo...</p>
                            ) : !catalog || catalog.length === 0 ? (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    Catálogo V2 vazio. Cadastre disciplinas/conteúdos/tópicos antes.
                                </p>
                            ) : (
                                catalog.map((subject) => {
                                    const subjExpanded = expanded.has(subject.id)
                                    const allSubjectTopics = subject.contents.flatMap((c) => c.topics.map((t) => t.id))
                                    const subjSelected = allSubjectTopics.filter((id) => selected.has(id)).length
                                    return (
                                        <div key={subject.id}>
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(subject.id)}
                                                className="w-full flex items-center gap-2 p-3 hover:bg-muted/30 text-left"
                                            >
                                                {subjExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                <span className="font-semibold">{subject.name}</span>
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    {subjSelected}/{allSubjectTopics.length} selecionados
                                                </span>
                                            </button>
                                            {subjExpanded && (
                                                <div className="bg-muted/10 border-t">
                                                    {subject.contents.map((content) => {
                                                        const contentExpanded = expanded.has(content.id)
                                                        const ids = content.topics.map((t) => t.id)
                                                        const allSel = ids.length > 0 && ids.every((id) => selected.has(id))
                                                        const someSel = ids.some((id) => selected.has(id))
                                                        return (
                                                            <div key={content.id} className="border-b last:border-0">
                                                                <div className="flex items-center gap-2 px-3 py-2 pl-8">
                                                                    <Checkbox
                                                                        checked={allSel ? true : someSel ? "indeterminate" : false}
                                                                        onCheckedChange={() => toggleContent(content)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleExpand(content.id)}
                                                                        className="flex items-center gap-1 text-sm flex-1 text-left"
                                                                    >
                                                                        {contentExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                                        {content.name}
                                                                    </button>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {ids.filter((id) => selected.has(id)).length}/{ids.length}
                                                                    </span>
                                                                </div>
                                                                {contentExpanded && (
                                                                    <ul className="pb-2">
                                                                        {content.topics.map((topic) => {
                                                                            const isSel = selected.has(topic.id)
                                                                            return (
                                                                                <li key={topic.id} className="flex items-center gap-2 pl-16 pr-3 py-1.5 hover:bg-muted/30">
                                                                                    <Checkbox
                                                                                        checked={isSel}
                                                                                        onCheckedChange={() => toggleTopic(topic.id)}
                                                                                    />
                                                                                    <span className="text-sm flex-1">
                                                                                        {topic.title}
                                                                                        {topic.defaultText && (
                                                                                            <span className="block text-xs text-muted-foreground truncate max-w-xs">
                                                                                                {topic.defaultText}
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                    {topic.studied && (
                                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                                                                            <CheckCircle2 className="h-3 w-3" /> já estudado
                                                                                        </span>
                                                                                    )}
                                                                                </li>
                                                                            )
                                                                        })}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <span className="text-sm text-muted-foreground mr-auto">
                            {selected.size} tópico{selected.size === 1 ? "" : "s"} selecionado{selected.size === 1 ? "" : "s"}
                        </span>
                        <Button variant="outline" onClick={() => setCreatingDialogOpen(false)} disabled={creating}>
                            Cancelar
                        </Button>
                        <Button onClick={submitCreate} disabled={creating || !label.trim() || selected.size === 0}>
                            {creating ? "Criando..." : `Criar Ciclo ${nextCycleNumber}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
