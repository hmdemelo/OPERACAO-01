"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, X, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"

type Content = {
    id: string
    name: string
    description?: string | null
}

type Subject = {
    id: string
    name: string
    description?: string | null
    active: boolean
    contents: Content[]
    _count: {
        users: number
        contents: number
    }
}

const createSubjectSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().max(2048, "Máximo de 2048 caracteres").optional(),
})

const updateSubjectSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().max(2048, "Máximo de 2048 caracteres").optional(),
    active: z.boolean(),
})

const contentSchema = z.object({
    name: z.string().min(2, "Nome do conteúdo deve ter pelo menos 2 caracteres"),
    description: z.string().max(2048, "Máximo de 2048 caracteres").optional(),
})

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Pagination
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // Search and Sort State
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    // Create Subject State
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Edit Subject State
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [activeTab, setActiveTab] = useState<"details" | "contents">("details")

    // Editing Content State (nested within Edit Subject)
    const [editingContent, setEditingContent] = useState<Content | null>(null)

    // Forms
    const {
        register: registerCreate,
        handleSubmit: handleSubmitCreate,
        reset: resetCreate,
        formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    } = useForm<z.infer<typeof createSubjectSchema>>({
        resolver: zodResolver(createSubjectSchema),
    })

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        setValue: setValueEdit,
        formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    } = useForm<z.infer<typeof updateSubjectSchema>>({
        resolver: zodResolver(updateSubjectSchema),
    })

    const {
        register: registerContent,
        handleSubmit: handleSubmitContent,
        reset: resetContent,
        setValue: setValueContent,
        formState: { errors: errorsContent, isSubmitting: isSubmittingContent },
    } = useForm<z.infer<typeof contentSchema>>({
        resolver: zodResolver(contentSchema),
    })

    const fetchSubjects = async () => {
        try {
            const res = await fetch("/api/admin/subjects")
            if (res.ok) {
                const data = await res.json()
                setSubjects(data)
            }
        } catch (error) {
            logger.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSubjects()
    }, [])

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    const processedSubjects = [...subjects]
        .filter(sub => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                (sub.name?.toLowerCase().includes(term)) ||
                (sub.description?.toLowerCase().includes(term))
            );
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;

            let aValue: any;
            let bValue: any;

            switch (key) {
                case 'name':
                    aValue = a.name || "";
                    bValue = b.name || "";
                    break;
                case 'active':
                    aValue = a.active ? 1 : 0;
                    bValue = b.active ? 1 : 0;
                    break;
                case 'contents':
                    aValue = a._count?.contents || a.contents?.length || 0;
                    bValue = b._count?.contents || b.contents?.length || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue === bValue) return 0;
            const res = aValue < bValue ? -1 : 1;
            return direction === 'asc' ? res : -res;
        });

    // Pagination Logic
    const offset = (page - 1) * limit
    const paginatedSubjects = processedSubjects.slice(offset, offset + limit)
    const totalPages = Math.ceil(processedSubjects.length / limit)


    // Open Edit Dialog
    const openEditSubject = (subject: Subject) => {
        setEditingSubject(subject)
        setValueEdit("name", subject.name)
        setValueEdit("description", subject.description || "")
        setValueEdit("active", subject.active)
        setActiveTab("details")
        setEditingContent(null)
        resetContent()
    }

    // Create Subject
    const onCreateSubject = async (data: z.infer<typeof createSubjectSchema>) => {
        try {
            const res = await fetch("/api/admin/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, active: true }),
            })
            if (!res.ok) throw new Error("Falha ao criar")
            await fetchSubjects()
            setIsCreateOpen(false)
            resetCreate()
            toast.success("Matéria criada com sucesso!")
        } catch (error) {
            toast.error("Erro ao criar matéria")
        }
    }

    // Update Subject
    const onUpdateSubject = async (data: z.infer<typeof updateSubjectSchema>) => {
        if (!editingSubject) return
        try {
            const res = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")

            const updated = await res.json()
            setEditingSubject(prev => prev ? { ...prev, ...updated } : null)
            await fetchSubjects()

            toast.success("Matéria atualizada com sucesso!")
        } catch (error) {
            toast.error("Erro ao atualizar matéria")
        }
    }

    // Add Content
    const onAddContent = async (data: z.infer<typeof contentSchema>) => {
        if (!editingSubject) return
        try {
            const res = await fetch(`/api/admin/subjects/${editingSubject.id}/contents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao adicionar")

            const newContent = await res.json()
            setEditingSubject(prev => prev ? {
                ...prev,
                contents: [...prev.contents, newContent]
            } : null)

            // Also update the main list count
            setSubjects(prev => prev.map(sub => sub.id === editingSubject.id
                ? { ...sub, contents: [...sub.contents, newContent], _count: { ...sub._count, contents: sub._count.contents + 1 } }
                : sub
            ))

            resetContent()
            toast.success("Conteúdo adicionado com sucesso!")
        } catch (error) {
            toast.error("Erro ao adicionar conteúdo")
        }
    }

    // Update Content
    const onUpdateContent = async (data: z.infer<typeof contentSchema>) => {
        if (!editingContent || !editingSubject) return
        try {
            const res = await fetch(`/api/admin/contents/${editingContent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar conteúdo")

            const updatedContent = await res.json()
            setEditingSubject(prev => prev ? {
                ...prev,
                contents: prev.contents.map(c => c.id === updatedContent.id ? updatedContent : c)
            } : null)

            // Update main list
            setSubjects(prev => prev.map(sub => sub.id === editingSubject.id
                ? { ...sub, contents: sub.contents.map(c => c.id === updatedContent.id ? updatedContent : c) }
                : sub
            ))

            setEditingContent(null)
            resetContent()
            toast.success("Conteúdo atualizado com sucesso!")
        } catch (error) {
            toast.error("Erro ao atualizar conteúdo")
        }
    }

    // Delete Content
    const onDeleteContent = async (contentId: string) => {
        try {
            const res = await fetch(`/api/admin/contents/${contentId}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Falha ao excluir")

            setEditingSubject(prev => prev ? {
                ...prev,
                contents: prev.contents.filter(c => c.id !== contentId)
            } : null)

            setSubjects(prev => prev.map(sub => sub.id === editingSubject?.id
                ? { ...sub, contents: sub.contents.filter(c => c.id !== contentId), _count: { ...sub._count, contents: sub._count.contents - 1 } }
                : sub
            ))
            toast.success("Conteúdo excluído com sucesso!")
        } catch (error) {
            toast.error("Erro ao excluir conteúdo")
        }
    }

    const startEditingContent = (content: Content) => {
        setEditingContent(content)
        setValueContent("name", content.name)
        setValueContent("description", content.description || "")
    }

    const cancelEditContent = () => {
        setEditingContent(null)
        resetContent()
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Cabecalho Fixo */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Matérias</h1>

                    <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar matérias..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 w-full bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => resetCreate()} className="gap-2 shadow-sm">
                                <Plus className="h-4 w-4" />
                                Criar Matéria
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Nova Matéria</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmitCreate(onCreateSubject)} className="space-y-4">
                                <div>
                                    <Label htmlFor="create-name">Nome</Label>
                                    <Input id="create-name" {...registerCreate("name")} />
                                    {errorsCreate.name && <p className="text-red-500 text-xs">{errorsCreate.name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="create-desc">Descrição</Label>
                                    <Textarea id="create-desc" {...registerCreate("description")} placeholder="Opcional" />
                                    {errorsCreate.description && <p className="text-red-500 text-xs">{errorsCreate.description.message}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmittingCreate}>Criar</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tabela com Scroll */}
            <div className="flex-1 overflow-auto border rounded-xl bg-card">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                                <div className="flex items-center">
                                    Nome
                                    {sortConfig?.key === 'name' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />
                                    ) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('active')}>
                                <div className="flex items-center">
                                    Status
                                    {sortConfig?.key === 'active' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />
                                    ) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('contents')}>
                                <div className="flex items-center">
                                    Conteúdos
                                    {sortConfig?.key === 'contents' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />
                                    ) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        Carregando matérias...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedSubjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                                    Nenhuma matéria encontrada para "{searchTerm}"
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedSubjects.map((sub) => (
                                <TableRow key={sub.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="text-sm font-semibold">{sub.name}</div>
                                        {sub.description && (
                                            <div className="text-[11px] text-muted-foreground truncate max-w-[300px] mt-0.5">{sub.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={sub.active ? "default" : "secondary"}
                                            className={sub.active ? "bg-orange-500 hover:bg-orange-600 border-none px-3 font-bold" : "px-3 underline font-bold"}
                                        >
                                            {sub.active ? "Ativa" : "Inativa"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-900/40 text-blue-100 border-none font-bold px-3 py-1"
                                        >
                                            {sub._count?.contents || sub.contents?.length || 0} Itens
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditSubject(sub)}
                                                className="gap-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Editar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Fixo de Paginação */}
            <div className="pt-4 mt-auto">
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={limit}
                    totalItems={processedSubjects.length}
                    onPageChange={setPage}
                    onPageSizeChange={setLimit}
                />
            </div>

            <Dialog open={!!editingSubject} onOpenChange={(open) => {
                if (!open) {
                    setEditingSubject(null)
                    setEditingContent(null)
                    resetContent()
                }
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Matéria: {editingSubject?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={activeTab === "details" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("details")}
                        >
                            Detalhes
                        </Button>
                        <Button
                            variant={activeTab === "contents" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("contents")}
                        >
                            Conteúdos ({editingSubject?.contents?.length || 0})
                        </Button>
                    </div>

                    {activeTab === "details" && (
                        <form onSubmit={handleSubmitEdit(onUpdateSubject)} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input id="edit-name" {...registerEdit("name")} />
                                {errorsEdit.name && <p className="text-red-500 text-xs">{errorsEdit.name.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-desc">Descrição</Label>
                                <Textarea id="edit-desc" {...registerEdit("description")} />
                                {errorsEdit.description && <p className="text-red-500 text-xs">{errorsEdit.description.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-active">Ativo</Label>
                                <Select
                                    defaultValue={editingSubject?.active ? "true" : "false"}
                                    onValueChange={(val) => setValueEdit("active", val === "true")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmittingEdit}>Salvar Alterações</Button>
                            </DialogFooter>
                        </form>
                    )}

                    {activeTab === "contents" && (
                        <div className="space-y-6">
                            <div className="space-y-4 border p-4 rounded bg-muted/20">
                                <h3 className="font-medium text-sm">
                                    {editingContent ? "Editar Conteúdo" : "Adicionar Novo Conteúdo"}
                                </h3>
                                <div className="grid gap-2">
                                    <div>
                                        <Label className="text-xs">Nome</Label>
                                        <Input {...registerContent("name")} className="h-8" />
                                        {errorsContent.name && <p className="text-red-500 text-xs">{errorsContent.name.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-xs">Descrição</Label>
                                        <Textarea {...registerContent("description")} className="h-14 min-h-[56px]" placeholder="Opcional" />
                                        {errorsContent.description && <p className="text-red-500 text-xs">{errorsContent.description.message}</p>}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        {editingContent && (
                                            <Button type="button" variant="ghost" size="sm" onClick={cancelEditContent}>Cancelar</Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={editingContent ? handleSubmitContent(onUpdateContent) : handleSubmitContent(onAddContent)}
                                            disabled={isSubmittingContent}
                                        >
                                            {editingContent ? "Atualizar" : "Adicionar"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Lista de Conteúdos</h3>
                                <div className="border rounded max-h-[300px] overflow-y-auto">
                                    {editingSubject?.contents?.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">Nenhum conteúdo cadastrado.</div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nome</TableHead>
                                                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editingSubject?.contents?.map((content) => (
                                                    <TableRow key={content.id}>
                                                        <TableCell>
                                                            <div className="font-medium text-sm">{content.name}</div>
                                                            {content.description && <div className="text-xs text-muted-foreground truncate max-w-[300px]">{content.description}</div>}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-1">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditingContent(content)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onDeleteContent(content.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
