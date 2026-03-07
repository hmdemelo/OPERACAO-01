"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Pencil, KeyRound, Search, ArrowUpDown, ArrowUp, ArrowDown, UserPlus, Trash2 } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"

type User = {
    id: string
    name: string | null
    email: string | null
    role: "ADMIN" | "MENTOR" | "STUDENT"
    active: boolean
    userSubjects?: { subject: { id: string, name: string } }[]
    userConcursos?: { concurso: { id: string, name: string } }[]
    studentLink?: { mentorId: string, mentor: { name: string | null } } | null
}



export default function AdminUsersPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Pagination State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)

    // Password Reset State
    const [passwordResetId, setPasswordResetId] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState("")

    // Delete State
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter State
    const [showInactive, setShowInactive] = useState(false)

    // Search and Sort State
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                ...(showInactive && { showInactive: "true" }),
            })
            const res = await fetch(`/api/admin/users?${params}`)
            if (res.ok) {
                const result = await res.json()
                setUsers(result.data)
                setTotalPages(result.meta.totalPages)
                setTotalUsers(result.meta.total)
            }
        } catch (error) {
            logger.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page, limit, showInactive])

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    const processedUsers = [...users]
        .filter(user => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                (user.name?.toLowerCase().includes(term)) ||
                (user.email?.toLowerCase().includes(term))
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
                case 'email':
                    aValue = a.email || "";
                    bValue = b.email || "";
                    break;
                case 'active':
                    aValue = a.active ? 1 : 0;
                    bValue = b.active ? 1 : 0;
                    break;
                case 'role':
                    aValue = a.role;
                    bValue = b.role;
                    break;
                case 'vinculos':
                    aValue = (a.userSubjects?.length || 0) + (a.userConcursos?.length || 0);
                    bValue = (b.userSubjects?.length || 0) + (b.userConcursos?.length || 0);
                    break;
                default:
                    return 0;
            }

            if (aValue === bValue) return 0;
            const res = aValue < bValue ? -1 : 1;
            return direction === 'asc' ? res : -res;
        });

    const onResetPassword = async () => {
        if (!passwordResetId || !newPassword) return

        try {
            const res = await fetch(`/api/admin/users/${passwordResetId}/reset-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            })

            if (!res.ok) throw new Error("Falha ao redefinir senha")

            toast.success("Senha atualizada com sucesso")
            setPasswordResetId(null)
            setNewPassword("")
        } catch (error) {
            toast.error("Erro ao redefinir senha")
        }
    }

    const onDeleteUser = async () => {
        if (!deleteTargetId) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${deleteTargetId}`, {
                method: "DELETE",
            })

            if (res.status === 403) {
                const msg = await res.text()
                toast.error(msg)
                return
            }

            if (!res.ok) throw new Error("Falha ao desativar usuário")

            toast.success("Usuário desativado com sucesso")
            setDeleteTargetId(null)
            fetchUsers()
        } catch (error) {
            toast.error("Erro ao desativar usuário")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Cabecalho Fixo */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h1>

                    <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 w-full bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Switch
                                id="show-inactive"
                                checked={showInactive}
                                onCheckedChange={(val: boolean) => {
                                    setShowInactive(val)
                                    setPage(1)
                                }}
                            />
                            <Label htmlFor="show-inactive" className="cursor-pointer whitespace-nowrap">
                                Mostrar inativos
                            </Label>
                        </div>

                        <Button onClick={() => router.push("/admin/users/new")} className="gap-2 shadow-sm">
                            <UserPlus className="h-4 w-4" />
                            Criar Usuário
                        </Button>
                    </div>
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
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                                <div className="flex items-center">
                                    E-mail
                                    {sortConfig?.key === 'email' ? (
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
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort('role')}>
                                <div className="flex items-center">
                                    Perfil
                                    {sortConfig?.key === 'role' ? (
                                        sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />
                                    ) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="select-none">
                                <div className="flex items-center">
                                    Mentor
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('vinculos')}>
                                <div className="flex items-center justify-end">
                                    Vínculos
                                    {sortConfig?.key === 'vinculos' ? (
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
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        Carregando usuários...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : processedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                                    Nenhum usuário encontrado para "{searchTerm}"
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedUsers.map((user) => (
                                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{user.name || "-"}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.active ? "default" : "secondary"}
                                            className={user.active ? "bg-orange-500 hover:bg-orange-600 border-none px-3 font-bold" : "px-3 underline font-bold"}
                                        >
                                            {user.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "border-none font-bold px-3 py-1 text-[10px]",
                                                user.role === "ADMIN" ? "bg-red-900/40 text-red-100" :
                                                    user.role === "MENTOR" ? "bg-purple-900/40 text-purple-100" :
                                                        "bg-blue-900/40 text-blue-100"
                                            )}
                                        >
                                            {{ STUDENT: "ALUNO", ADMIN: "ADMINISTRADOR", MENTOR: "MENTOR" }[user.role]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground font-medium">
                                            {user.role === "STUDENT"
                                                ? (user.studentLink?.mentor?.name || "Sem Mentor")
                                                : "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col gap-0.5 items-end">
                                            <div className="text-[11px] font-medium text-muted-foreground">
                                                Matérias: {user.userSubjects?.length || 0}
                                            </div>
                                            <div className="text-[11px] font-medium text-muted-foreground">
                                                Concursos: {user.userConcursos?.length || 0}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                                className="h-8 w-8"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPasswordResetId(user.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                            {user.id !== session?.user?.id && user.role !== "ADMIN" && user.active && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteTargetId(user.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
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
                    totalItems={totalUsers}
                    onPageChange={setPage}
                    onPageSizeChange={setLimit}
                />
            </div>



            <Dialog open={!!passwordResetId} onOpenChange={(open) => !open && setPasswordResetId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                        <DialogDescription>Digite a nova senha para o usuário.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Nova Senha</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordResetId(null)}>Cancelar</Button>
                        <Button onClick={onResetPassword}>Atualizar Senha</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Desativar usuário?</DialogTitle>
                        <DialogDescription>
                            O usuário será desativado e não poderá mais acessar o sistema.
                            Esta ação pode ser revertida editando o usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTargetId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDeleteUser}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Desativando..." : "Desativar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
