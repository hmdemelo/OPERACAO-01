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
import { Pencil, Trash2 } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"

type Concurso = {
    id: string
    name: string
    description?: string | null
    active: boolean
    _count: {
        users: number
    }
}

const createConcursoSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().max(2048, "Máximo de 2048 caracteres").optional(),
})

const updateConcursoSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().max(2048, "Máximo de 2048 caracteres").optional(),
    active: z.boolean(),
})

export default function AdminConcursosPage() {
    const [concursos, setConcursos] = useState<Concurso[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Pagination
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Edit State
    const [editingConcurso, setEditingConcurso] = useState<Concurso | null>(null)

    // Forms
    const {
        register: registerCreate,
        handleSubmit: handleSubmitCreate,
        reset: resetCreate,
        formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    } = useForm<z.infer<typeof createConcursoSchema>>({
        resolver: zodResolver(createConcursoSchema),
    })

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        setValue: setValueEdit,
        formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    } = useForm<z.infer<typeof updateConcursoSchema>>({
        resolver: zodResolver(updateConcursoSchema),
    })

    const fetchConcursos = async () => {
        try {
            const res = await fetch("/api/admin/concursos")
            if (res.ok) {
                const data = await res.json()
                setConcursos(data)
            }
        } catch (error) {
            logger.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConcursos()
    }, [])

    // Pagination Logic
    const offset = (page - 1) * limit
    const paginatedConcursos = concursos.slice(offset, offset + limit)
    const totalPages = Math.ceil(concursos.length / limit)

    // Open Edit Dialog
    const openEditConcurso = (concurso: Concurso) => {
        setEditingConcurso(concurso)
        setValueEdit("name", concurso.name)
        setValueEdit("description", concurso.description || "")
        setValueEdit("active", concurso.active)
    }

    // Create Concurso
    const onCreateConcurso = async (data: z.infer<typeof createConcursoSchema>) => {
        try {
            const res = await fetch("/api/admin/concursos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, active: true }),
            })
            if (!res.ok) throw new Error("Falha ao criar")
            await fetchConcursos()
            setIsCreateOpen(false)
            resetCreate()
            toast.success("Concurso criado com sucesso!")
        } catch (error) {
            toast.error("Erro ao criar concurso")
        }
    }

    // Update Concurso
    const onUpdateConcurso = async (data: z.infer<typeof updateConcursoSchema>) => {
        if (!editingConcurso) return
        try {
            const res = await fetch(`/api/admin/concursos/${editingConcurso.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")

            await fetchConcursos()
            setEditingConcurso(null)
            toast.success("Concurso atualizado com sucesso!")
        } catch (error) {
            toast.error("Erro ao atualizar concurso")
        }
    }

    // Delete Concurso
    const onDeleteConcurso = async () => {
        if (!editingConcurso) return
        if (!confirm("Tem certeza que deseja excluir este concurso?")) return

        try {
            const res = await fetch(`/api/admin/concursos/${editingConcurso.id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Falha ao excluir")

            await fetchConcursos()
            setEditingConcurso(null)
            toast.success("Concurso excluído com sucesso!")
        } catch (error) {
            toast.error("Erro ao excluir concurso")
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciamento de Concursos</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetCreate()}>Criar Concurso</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Concurso</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitCreate(onCreateConcurso)} className="space-y-4">
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

            <div className="border rounded-lg p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Usuários</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                            </TableRow>
                        ) : paginatedConcursos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Nenhum concurso encontrado</TableCell>
                            </TableRow>
                        ) : (
                            paginatedConcursos.map((concurso) => (
                                <TableRow key={concurso.id}>
                                    <TableCell className="font-medium">
                                        <div>{concurso.name}</div>
                                        {concurso.description && (
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{concurso.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={concurso.active ? "default" : "secondary"}>
                                            {concurso.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{concurso._count?.users || 0}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditConcurso(concurso)}
                                        >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                pageSize={limit}
                totalItems={concursos.length}
                onPageChange={setPage}
                onPageSizeChange={setLimit}
            />

            <Dialog open={!!editingConcurso} onOpenChange={(open) => !open && setEditingConcurso(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Concurso: {editingConcurso?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit(onUpdateConcurso)} className="space-y-4">
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
                                defaultValue={editingConcurso?.active ? "true" : "false"}
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
                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            <Button type="button" variant="destructive" onClick={onDeleteConcurso}>Excluir</Button>
                            <Button type="submit" disabled={isSubmittingEdit}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
