"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, Layers, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Student = {
    id: string
    name: string | null
    email: string | null
    active: boolean
    appVersion: string
    studentLink?: { mentor: { name: string | null } } | null
    studyGrid?: { blocks: { id: string }[] } | null
}

export function V2StudentsClient({ role }: { role: "ADMIN" | "MENTOR" }) {
    const router = useRouter()
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            try {
                const res = await fetch("/api/admin/users?limit=200&v2=true")
                if (!res.ok) throw new Error()
                const result = await res.json()
                setStudents(result.data.filter((u: any) => u.appVersion === "v2"))
            } catch {
                toast.error("Erro ao carregar alunos V2")
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const filtered = students.filter((s) => {
        if (!searchTerm) return true
        const t = searchTerm.toLowerCase()
        return s.name?.toLowerCase().includes(t) || s.email?.toLowerCase().includes(t)
    })

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Alunos V2
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {role === "MENTOR"
                                ? "Seus alunos com acesso à nova plataforma de grade de estudos."
                                : "Alunos com acesso à nova plataforma de grade de estudos."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                        {role === "ADMIN" && (
                            <Button onClick={() => router.push("/admin/users/new")} className="gap-2 shadow-sm whitespace-nowrap">
                                <UserPlus className="h-4 w-4" />
                                Novo Aluno V2
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl bg-card">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Mentor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                                    {searchTerm ? `Nenhum resultado para "${searchTerm}"` : "Nenhum aluno V2 cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{student.name || "-"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {student.studentLink?.mentor?.name || "Sem Mentor"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={student.active ? "default" : "secondary"}
                                            className={student.active ? "bg-orange-500 hover:bg-orange-600 border-none px-3 font-bold" : "px-3 font-bold"}
                                        >
                                            {student.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                                            onClick={() => router.push(`/admin/students/${student.id}/grade`)}
                                        >
                                            <Layers className="h-3.5 w-3.5" />
                                            Gerenciar Grade
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
