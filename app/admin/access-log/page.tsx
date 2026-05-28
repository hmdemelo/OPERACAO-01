"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Activity, RefreshCw, Circle, User, Clock, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type SessionRow = {
    id: string
    userId: string
    userName: string
    userEmail: string
    userRole: string
    loginAt: string
    logoutAt: string | null
    lastSeenAt: string
    durationMin: number
    isActive: boolean
    ipAddress: string | null
    userAgent: string | null
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(min: number) {
    if (min < 1) return "< 1 min"
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function parseUserAgent(ua: string | null) {
    if (!ua) return "—"
    if (/mobile/i.test(ua)) return "Mobile"
    if (/tablet/i.test(ua)) return "Tablet"
    return "Desktop"
}

export default function AccessLogPage() {
    const [rows, setRows] = useState<SessionRow[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const limit = 50

    const load = useCallback(async (p: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/access-log?page=${p}&limit=${limit}`)
            if (res.status === 403) {
                toast.error("Acesso restrito ao admin master")
                return
            }
            if (!res.ok) throw new Error()
            const data = await res.json()
            setRows(data.rows)
            setTotal(data.total)
            setPage(p)
        } catch {
            toast.error("Erro ao carregar histórico")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load(1) }, [load])

    const activeNow = rows.filter(r => r.isActive).length
    const todayRows = rows.filter(r => new Date(r.loginAt).toDateString() === new Date().toDateString())
    const avgDuration = rows.length > 0
        ? Math.round(rows.reduce((s, r) => s + r.durationMin, 0) / rows.length)
        : 0

    const filtered = search
        ? rows.filter(r =>
            r.userName?.toLowerCase().includes(search.toLowerCase()) ||
            r.userEmail?.toLowerCase().includes(search.toLowerCase())
        )
        : rows

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Rastreio de Acesso
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Histórico de logins e tempo de sessão — últimos 90 dias
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => load(page)} disabled={loading} className="gap-2">
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Ativos agora</p>
                    <p className="text-3xl font-black mt-1 text-primary">{activeNow}</p>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Sessões hoje</p>
                    <p className="text-3xl font-black mt-1">{todayRows.length}</p>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total no período</p>
                    <p className="text-3xl font-black mt-1">{total}</p>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Duração média</p>
                    <p className="text-3xl font-black mt-1">{formatDuration(avgDuration)}</p>
                </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-xl bg-card overflow-hidden">
                <div className="p-4 border-b">
                    <Input
                        placeholder="Filtrar por nome ou e-mail..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="max-w-sm h-9 bg-muted/50 border-none"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 border-b">
                            <tr>
                                <th className="text-left p-3 font-semibold">Usuário</th>
                                <th className="text-left p-3 font-semibold">Perfil</th>
                                <th className="text-left p-3 font-semibold">Login</th>
                                <th className="text-left p-3 font-semibold">Logout</th>
                                <th className="text-left p-3 font-semibold">Duração</th>
                                <th className="text-left p-3 font-semibold">Dispositivo</th>
                                <th className="text-left p-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma sessão encontrada.</td></tr>
                            ) : (
                                filtered.map(r => (
                                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium leading-tight">{r.userName || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="secondary" className="text-xs">
                                                {r.userRole === "ADMIN" ? "Admin" : r.userRole === "MENTOR" ? "Mentor" : "Aluno"}
                                            </Badge>
                                        </td>
                                        <td className="p-3 tabular-nums text-muted-foreground">
                                            {formatDate(r.loginAt)}
                                        </td>
                                        <td className="p-3 tabular-nums text-muted-foreground">
                                            {r.logoutAt ? formatDate(r.logoutAt) : "—"}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(r.durationMin)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Monitor className="h-3 w-3" />
                                                {parseUserAgent(r.userAgent)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {r.isActive ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                                    <Circle className="h-2 w-2 fill-emerald-500" />
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Encerrada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                        <span>{total} sessões no total</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => load(page - 1)} disabled={page <= 1 || loading}>
                                Anterior
                            </Button>
                            <span className="flex items-center px-2">{page} / {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => load(page + 1)} disabled={page >= totalPages || loading}>
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
