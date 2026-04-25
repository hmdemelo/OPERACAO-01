"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Search, Filter, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { isSuperAdmin } from "@/lib/auth/superAdmin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { QuestionReviewCard, type ReviewQuestion } from "@/components/admin/questions/QuestionReviewCard"
import { QuestionUploadFAB } from "@/components/QuestionUploadFAB"

type QuestionStatus = "PENDING" | "APPROVED" | "REJECTED"

type ApiResponse = {
    questions: ReviewQuestion[]
    total: number
    page: number
    totalPages: number
    pageSize: number
    filters: {
        subjects: { id: string; name: string }[]
        contents: { id: string; name: string; subjectId: string }[]
        years: number[]
        sources: string[]
    }
}

const ANY = "__ANY__"

export default function AdminQuestionsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const isMaster =
        session?.user?.role === "ADMIN" && isSuperAdmin(session?.user?.email)
    const currentUserId = session?.user?.id

    const status = (searchParams.get("status") as QuestionStatus | null) || "PENDING"
    const page = Number(searchParams.get("page")) || 1
    const subjectId = searchParams.get("subjectId") || ""
    const contentId = searchParams.get("contentId") || ""
    const year = searchParams.get("year") || ""
    const source = searchParams.get("source") || ""
    const q = searchParams.get("q") || ""

    const [searchInput, setSearchInput] = useState(q)
    const [data, setData] = useState<ApiResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            params.set("status", status)
            params.set("page", page.toString())
            if (subjectId) params.set("subjectId", subjectId)
            if (contentId) params.set("contentId", contentId)
            if (year) params.set("year", year)
            if (source) params.set("source", source)
            if (q) params.set("q", q)

            const res = await fetch(`/api/admin/questions?${params}`)
            if (res.ok) {
                setData(await res.json())
            }
        } finally {
            setIsLoading(false)
        }
    }, [status, page, subjectId, contentId, year, source, q])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    useEffect(() => {
        setSearchInput(q)
    }, [q])

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") params.delete(key)
            else params.set(key, value)
        }
        // Reset to page 1 when filter changes (except page itself)
        if (!("page" in updates)) params.set("page", "1")
        router.push(`/admin/questions?${params}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateParams({ q: searchInput || null })
    }

    const clearFilters = () => {
        router.push(`/admin/questions?status=${status}`)
    }

    const hasActiveFilters = subjectId || contentId || year || source || q
    const filteredContents = data?.filters.contents.filter((c) => !subjectId || c.subjectId === subjectId) || []

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-6 w-6" /> Banco de Questões
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Revise, aprove e gerencie as questões enviadas.
                    </p>
                </div>
            </div>

            {/* Status tabs */}
            <div className="flex bg-muted rounded-lg p-1 w-fit">
                {(["PENDING", "APPROVED", "REJECTED"] as QuestionStatus[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => updateParams({ status: s, page: null })}
                        className={`px-4 py-1.5 text-sm rounded-md transition-all ${status === s ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {s === "PENDING" ? "Pendentes" : s === "APPROVED" ? "Aprovadas" : "Rejeitadas"}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="border rounded-xl bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Filter className="h-4 w-4" /> Filtros
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-muted-foreground hover:text-foreground underline ml-auto"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buscar no enunciado..."
                        className="pl-9 pr-20"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                    >
                        Buscar
                    </Button>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Select value={subjectId || ANY} onValueChange={(v) => updateParams({ subjectId: v === ANY ? null : v, contentId: null })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Disciplina" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Todas disciplinas</SelectItem>
                            {data?.filters.subjects.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={contentId || ANY} onValueChange={(v) => updateParams({ contentId: v === ANY ? null : v })} disabled={!subjectId}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Conteúdo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Todos conteúdos</SelectItem>
                            {filteredContents.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year || ANY} onValueChange={(v) => updateParams({ year: v === ANY ? null : v })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Ano" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Todos anos</SelectItem>
                            {data?.filters.years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={source || ANY} onValueChange={(v) => updateParams({ source: v === ANY ? null : v })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Fonte" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Todas fontes</SelectItem>
                            {data?.filters.sources.map((src) => (
                                <SelectItem key={src} value={src}>{src}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {q && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                                Busca: &quot;{q}&quot;
                                <button onClick={() => updateParams({ q: null })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Results count */}
            {data && !isLoading && (
                <div className="text-sm text-muted-foreground">
                    <strong>{data.total}</strong> {data.total === 1 ? "questão encontrada" : "questões encontradas"}
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : !data || data.questions.length === 0 ? (
                <div className="border rounded-xl bg-card p-12 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma questão encontrada.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.questions.map((question) => {
                        const uploader = question.uploadedBy
                        const uploaderMentorId = uploader?.studentLink?.mentorId
                        const canApprove = isMaster
                            ? true
                            : uploader?.role !== "STUDENT"
                                ? true
                                : !uploaderMentorId
                                    ? true
                                    : currentUserId === uploaderMentorId
                        return (
                            <QuestionReviewCard
                                key={question.id}
                                question={question}
                                subjects={data.filters.subjects}
                                contents={data.filters.contents}
                                onChanged={fetchQuestions}
                                canApprove={canApprove}
                            />
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Página {data.page} de {data.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateParams({ page: (page - 1).toString() })}
                            disabled={page <= 1}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateParams({ page: (page + 1).toString() })}
                            disabled={page >= data.totalPages}
                            className="gap-1"
                        >
                            Próxima <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <QuestionUploadFAB />
        </div>
    )
}
