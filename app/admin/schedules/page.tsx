"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    Edit,
    BookOpen
} from "lucide-react"
import Link from "next/link"
import { format, startOfWeek, addWeeks, subWeeks, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

import { PaginationControls } from "@/components/ui/pagination-controls"
import { SubjectLinkModal } from "@/components/admin/SubjectLinkModal"

type PlanOverviewItem = {
    userId: string
    name: string | null
    email: string | null
    active: boolean
    hasPlan: boolean
    totalBlocks: number
    completedBlocks: number
    progressPercentage: number
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

export default function AdminOverviewPage() {
    const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }))
    const [data, setData] = useState<PlanOverviewItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>("ALL")
    const [searchTerm, setSearchTerm] = useState("")

    // Pagination State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(30)

    // Subject Link Modal State
    const [subjectModalOpen, setSubjectModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<{ id: string, name: string } | null>(null)

    const fetchOverview = async () => {
        setIsLoading(true)
        try {
            const dateStr = format(weekStart, 'yyyy-MM-dd')
            const res = await fetch(`/api/admin/plans/overview?weekStart=${dateStr}`)
            if (res.ok) {
                const result = await res.json()
                setData(result)
            }
        } catch (error) {
            logger.error("Failed to fetch overview", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOverview()
    }, [weekStart])

    const handlePrevWeek = () => setWeekStart(prev => subWeeks(prev, 1))
    const handleNextWeek = () => setWeekStart(prev => addWeeks(prev, 1))

    // Filtering logic
    const filteredData = data.filter(item => {
        const matchesStatus = filterStatus === "ALL" || item.status === filterStatus
        const matchesSearch = searchTerm === "" ||
            (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesStatus && matchesSearch
    })

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [filterStatus, searchTerm, limit])

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / limit)
    const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

    // Stats
    const totalStudents = data.length
    const plansCreated = data.filter(i => i.hasPlan).length
    const pendingPlans = data.filter(i => !i.hasPlan).length

    // Avg Progress of created plans
    const avgProgress = plansCreated > 0
        ? Math.round(data.filter(i => i.hasPlan).reduce((acc, curr) => acc + curr.progressPercentage, 0) / plansCreated)
        : 0

    const weekRangeStr = `${format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - ${format(endOfWeek(weekStart), "dd 'de' MMMM", { locale: ptBR })}`

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciamento de Cronogramas</h1>
                    <p className="text-muted-foreground">Visão geral do progresso semanal dos alunos.</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
                    <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-2 font-medium min-w-[200px] justify-center">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="capitalize">{weekRangeStr}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cronogramas Criados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plansCreated}</div>
                        <p className="text-xs text-muted-foreground">
                            {plansCreated > 0 ? ((plansCreated / totalStudents) * 100).toFixed(0) : 0}% do total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{pendingPlans}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgProgress}%</div>
                        <ProgressBar value={avgProgress} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar aluno..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <FilterButton
                        active={filterStatus === "ALL"}
                        onClick={() => setFilterStatus("ALL")}
                        label="Todos"
                    />
                    <FilterButton
                        active={filterStatus === "PENDING"}
                        onClick={() => setFilterStatus("PENDING")}
                        label="Pendentes"
                        count={data.filter(i => i.status === "PENDING").length}
                    />
                    <FilterButton
                        active={filterStatus === "IN_PROGRESS"}
                        onClick={() => setFilterStatus("IN_PROGRESS")}
                        label="Em Andamento"
                        count={data.filter(i => i.status === "IN_PROGRESS").length}
                    />
                    <FilterButton
                        active={filterStatus === "COMPLETED"}
                        onClick={() => setFilterStatus("COMPLETED")}
                        label="Concluídos"
                        count={data.filter(i => i.status === "COMPLETED").length}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Progresso</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Carregando...</TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Nenhum aluno encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item) => (
                                <TableRow key={item.userId}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.name || "Sem Nome"}</span>
                                            <span className="text-xs text-muted-foreground">{item.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} hasPlan={item.hasPlan} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-[180px] space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>{item.completedBlocks}/{item.totalBlocks} blocos</span>
                                                <span className="font-medium">{item.progressPercentage}%</span>
                                            </div>
                                            <ProgressBar value={item.progressPercentage} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Vincular Matérias"
                                                onClick={() => {
                                                    setSelectedStudent({ id: item.userId, name: item.name || "Aluno" })
                                                    setSubjectModalOpen(true)
                                                }}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/admin/students/${item.userId}/weekly-plan?date=${format(weekStart, 'yyyy-MM-dd')}`}>
                                                {item.hasPlan ? (
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Edit className="h-3 w-3" />
                                                        Editar
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        Criar Plano
                                                    </Button>
                                                )}
                                            </Link>
                                        </div>
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
                totalItems={filteredData.length}
                onPageChange={setPage}
                onPageSizeChange={setLimit}
                pageSizeOptions={[30, 50]}
            />

            {/* Subject Link Modal */}
            {selectedStudent && (
                <SubjectLinkModal
                    studentId={selectedStudent.id}
                    studentName={selectedStudent.name}
                    open={subjectModalOpen}
                    onClose={() => {
                        setSubjectModalOpen(false)
                        setSelectedStudent(null)
                    }}
                />
            )}
        </div>
    )
}

// Components

function FilterButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count?: number }) {
    return (
        <Button
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className="whitespace-nowrap"
        >
            {label}
            {count !== undefined && <span className={`ml-2 text-xs ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>({count})</span>}
        </Button>
    )
}

function StatusBadge({ status, hasPlan }: { status: string, hasPlan: boolean }) {
    if (!hasPlan) {
        return <Badge variant="destructive">Pendente</Badge>
    }
    switch (status) {
        case "COMPLETED":
            return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>
        case "IN_PROGRESS":
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Em Andamento</Badge>
        default:
            return <Badge variant="secondary">Pendente</Badge>
    }
}

function ProgressBar({ value, className = "" }: { value: number, className?: string }) {
    return (
        <div className={`w-full bg-secondary h-2 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${value}%` }}
            />
        </div>
    )
}
