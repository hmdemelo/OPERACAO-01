'use client'

import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Topic {
    id: string
    title: string
    defaultText: string | null
    order: number
}

interface Content {
    id: string
    name: string
    order: number
    topics: Topic[]
}

interface Subject {
    id: string
    name: string
    order: number
    active: boolean
    contents: Content[]
}

export function CatalogEditor({ initialSubjects }: { initialSubjects: Subject[] }) {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [newSubjectName, setNewSubjectName] = useState("")
    const [busy, setBusy] = useState(false)
    const [editingSubject, setEditingSubject] = useState<string | null>(null)
    const [editingSubjectName, setEditingSubjectName] = useState("")

    const [newContentDrafts, setNewContentDrafts] = useState<Record<string, string>>({})
    const [editingContent, setEditingContent] = useState<string | null>(null)
    const [editingContentName, setEditingContentName] = useState("")

    const [newTopicTitle, setNewTopicTitle] = useState<Record<string, string>>({})
    const [newTopicText, setNewTopicText] = useState<Record<string, string>>({})
    const [editingTopic, setEditingTopic] = useState<string | null>(null)
    const [editingTopicData, setEditingTopicData] = useState<{ title: string; defaultText: string }>({
        title: "",
        defaultText: "",
    })

    function toggle(id: string) {
        setExpanded((e) => ({ ...e, [id]: !e[id] }))
    }

    // ---------- SUBJECTS ----------
    async function addSubject() {
        const name = newSubjectName.trim()
        if (!name) return
        setBusy(true)
        try {
            const res = await fetch("/api/admin/v2/catalog/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error()
            const subject = await res.json()
            setSubjects((prev) => [...prev, { ...subject, contents: subject.contents ?? [] }])
            setNewSubjectName("")
            toast.success("Disciplina criada")
        } catch {
            toast.error("Erro ao criar disciplina")
        } finally {
            setBusy(false)
        }
    }

    async function saveSubjectName(id: string) {
        const name = editingSubjectName.trim()
        if (!name) return
        try {
            const res = await fetch(`/api/admin/v2/catalog/subjects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error()
            setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
            setEditingSubject(null)
        } catch {
            toast.error("Erro ao salvar")
        }
    }

    async function deleteSubject(id: string) {
        if (!confirm("Excluir esta disciplina e todos os seus conteúdos/assuntos?")) return
        try {
            const res = await fetch(`/api/admin/v2/catalog/subjects/${id}`, { method: "DELETE" })
            if (!res.ok) {
                toast.error(await res.text())
                return
            }
            setSubjects((prev) => prev.filter((s) => s.id !== id))
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    // ---------- CONTENTS ----------
    async function addContent(subjectId: string) {
        const name = (newContentDrafts[subjectId] || "").trim()
        if (!name) return
        try {
            const res = await fetch("/api/admin/v2/catalog/contents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectV2Id: subjectId, name }),
            })
            if (!res.ok) throw new Error()
            const content = await res.json()
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId
                        ? { ...s, contents: [...s.contents, { ...content, topics: content.topics ?? [] }] }
                        : s
                )
            )
            setNewContentDrafts((d) => ({ ...d, [subjectId]: "" }))
        } catch {
            toast.error("Erro ao criar conteúdo")
        }
    }

    async function saveContentName(contentId: string, subjectId: string) {
        const name = editingContentName.trim()
        if (!name) return
        try {
            const res = await fetch(`/api/admin/v2/catalog/contents/${contentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error()
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId
                        ? { ...s, contents: s.contents.map((c) => (c.id === contentId ? { ...c, name } : c)) }
                        : s
                )
            )
            setEditingContent(null)
        } catch {
            toast.error("Erro ao salvar")
        }
    }

    async function deleteContent(contentId: string, subjectId: string) {
        if (!confirm("Excluir este conteúdo e todos os seus assuntos?")) return
        try {
            const res = await fetch(`/api/admin/v2/catalog/contents/${contentId}`, { method: "DELETE" })
            if (!res.ok) {
                toast.error(await res.text())
                return
            }
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId ? { ...s, contents: s.contents.filter((c) => c.id !== contentId) } : s
                )
            )
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    // ---------- TOPICS ----------
    async function addTopic(contentId: string, subjectId: string) {
        const title = (newTopicTitle[contentId] || "").trim()
        if (!title) {
            toast.error("Informe o título do assunto")
            return
        }
        const defaultText = (newTopicText[contentId] || "").trim() || null
        try {
            const res = await fetch("/api/admin/v2/catalog/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentV2Id: contentId, title, defaultText }),
            })
            if (!res.ok) throw new Error()
            const topic = await res.json()
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId
                        ? {
                            ...s,
                            contents: s.contents.map((c) =>
                                c.id === contentId ? { ...c, topics: [...c.topics, topic] } : c
                            ),
                        }
                        : s
                )
            )
            setNewTopicTitle((d) => ({ ...d, [contentId]: "" }))
            setNewTopicText((d) => ({ ...d, [contentId]: "" }))
        } catch {
            toast.error("Erro ao criar assunto")
        }
    }

    async function saveTopic(topicId: string, contentId: string, subjectId: string) {
        const title = editingTopicData.title.trim()
        if (!title) return
        const defaultText = editingTopicData.defaultText.trim() || null
        try {
            const res = await fetch(`/api/admin/v2/catalog/topics/${topicId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, defaultText }),
            })
            if (!res.ok) throw new Error()
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId
                        ? {
                            ...s,
                            contents: s.contents.map((c) =>
                                c.id === contentId
                                    ? {
                                        ...c,
                                        topics: c.topics.map((t) =>
                                            t.id === topicId ? { ...t, title, defaultText } : t
                                        ),
                                    }
                                    : c
                            ),
                        }
                        : s
                )
            )
            setEditingTopic(null)
        } catch {
            toast.error("Erro ao salvar")
        }
    }

    async function deleteTopic(topicId: string, contentId: string, subjectId: string) {
        if (!confirm("Excluir este assunto?")) return
        try {
            const res = await fetch(`/api/admin/v2/catalog/topics/${topicId}`, { method: "DELETE" })
            if (!res.ok) {
                toast.error(await res.text())
                return
            }
            setSubjects((prev) =>
                prev.map((s) =>
                    s.id === subjectId
                        ? {
                            ...s,
                            contents: s.contents.map((c) =>
                                c.id === contentId ? { ...c, topics: c.topics.filter((t) => t.id !== topicId) } : c
                            ),
                        }
                        : s
                )
            )
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1.5 block">Nova disciplina</label>
                        <Input
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="ex: Direito Constitucional"
                            onKeyDown={(e) => e.key === "Enter" && addSubject()}
                        />
                    </div>
                    <Button onClick={addSubject} disabled={busy || !newSubjectName.trim()}>
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Adicionar
                    </Button>
                </CardContent>
            </Card>

            {subjects.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    Nenhuma disciplina no catálogo. Crie a primeira acima.
                </p>
            )}

            {subjects.map((subject) => (
                <Card key={subject.id}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => toggle(subject.id)}
                            >
                                {expanded[subject.id] ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                            {editingSubject === subject.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                    <Input
                                        value={editingSubjectName}
                                        onChange={(e) => setEditingSubjectName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && saveSubjectName(subject.id)}
                                        autoFocus
                                        className="h-8"
                                    />
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveSubjectName(subject.id)}>
                                        <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSubject(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <CardTitle className="text-base flex items-center gap-2 flex-1">
                                    {subject.name}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        ({subject.contents.length} conteúdo{subject.contents.length !== 1 ? "s" : ""})
                                    </span>
                                </CardTitle>
                            )}
                        </div>
                        {editingSubject !== subject.id && (
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                        setEditingSubject(subject.id)
                                        setEditingSubjectName(subject.name)
                                    }}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => deleteSubject(subject.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </CardHeader>

                    {expanded[subject.id] && (
                        <CardContent className="space-y-3 border-t pt-4">
                            {subject.contents.map((content) => (
                                <div key={content.id} className="border border-border/50 rounded-md p-3 space-y-2 bg-muted/20">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() => toggle(content.id)}
                                            >
                                                {expanded[content.id] ? (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                            {editingContent === content.id ? (
                                                <div className="flex items-center gap-1 flex-1">
                                                    <Input
                                                        value={editingContentName}
                                                        onChange={(e) => setEditingContentName(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && saveContentName(content.id, subject.id)}
                                                        autoFocus
                                                        className="h-7 text-sm"
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveContentName(content.id, subject.id)}>
                                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingContent(null)}>
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium flex items-center gap-2">
                                                    {content.name}
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        ({content.topics.length} assunto{content.topics.length !== 1 ? "s" : ""})
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        {editingContent !== content.id && (
                                            <div className="flex gap-0.5">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        setEditingContent(content.id)
                                                        setEditingContentName(content.name)
                                                    }}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={() => deleteContent(content.id, subject.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {expanded[content.id] && (
                                        <div className="pl-8 space-y-2 pt-1">
                                            {content.topics.map((topic) => (
                                                <div key={topic.id} className="border border-border/30 rounded p-2 bg-background/60 space-y-1">
                                                    {editingTopic === topic.id ? (
                                                        <>
                                                            <Input
                                                                value={editingTopicData.title}
                                                                maxLength={255}
                                                                onChange={(e) =>
                                                                    setEditingTopicData((d) => ({ ...d, title: e.target.value }))
                                                                }
                                                                placeholder="Título do assunto"
                                                                className="h-7 text-sm"
                                                            />
                                                            <Textarea
                                                                value={editingTopicData.defaultText}
                                                                maxLength={255}
                                                                rows={2}
                                                                onChange={(e) =>
                                                                    setEditingTopicData((d) => ({ ...d, defaultText: e.target.value }))
                                                                }
                                                                placeholder="Texto padrão (255 chars, opcional)"
                                                                className="text-sm"
                                                            />
                                                            <div className="flex gap-1 justify-end">
                                                                <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingTopic(null)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7"
                                                                    onClick={() => saveTopic(topic.id, content.id, subject.id)}
                                                                >
                                                                    Salvar
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium">{topic.title}</p>
                                                                    {topic.defaultText && (
                                                                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                                                            {topic.defaultText}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-0.5 shrink-0">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6"
                                                                        onClick={() => {
                                                                            setEditingTopic(topic.id)
                                                                            setEditingTopicData({
                                                                                title: topic.title,
                                                                                defaultText: topic.defaultText ?? "",
                                                                            })
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-destructive"
                                                                        onClick={() => deleteTopic(topic.id, content.id, subject.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="border border-dashed rounded p-2 space-y-1.5 bg-background/40">
                                                <Input
                                                    value={newTopicTitle[content.id] || ""}
                                                    maxLength={255}
                                                    onChange={(e) =>
                                                        setNewTopicTitle((d) => ({ ...d, [content.id]: e.target.value }))
                                                    }
                                                    placeholder="Título do novo assunto"
                                                    className="h-7 text-sm"
                                                />
                                                <Textarea
                                                    value={newTopicText[content.id] || ""}
                                                    maxLength={255}
                                                    rows={2}
                                                    onChange={(e) =>
                                                        setNewTopicText((d) => ({ ...d, [content.id]: e.target.value }))
                                                    }
                                                    placeholder="Texto padrão (opcional, máx. 255 chars, links viram clicáveis)"
                                                    className="text-sm"
                                                />
                                                <Button
                                                    size="sm"
                                                    className="h-7 gap-1.5"
                                                    onClick={() => addTopic(content.id, subject.id)}
                                                    disabled={!(newTopicTitle[content.id] || "").trim()}
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> Adicionar assunto
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Input
                                    value={newContentDrafts[subject.id] || ""}
                                    onChange={(e) =>
                                        setNewContentDrafts((d) => ({ ...d, [subject.id]: e.target.value }))
                                    }
                                    placeholder="Nome do novo conteúdo"
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => e.key === "Enter" && addContent(subject.id)}
                                />
                                <Button
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => addContent(subject.id)}
                                    disabled={!(newContentDrafts[subject.id] || "").trim()}
                                >
                                    <Plus className="h-3.5 w-3.5" /> Conteúdo
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    )
}
