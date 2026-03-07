"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Shield,
    BarChart3,
    Save,
    Loader2,
    Users,
    BookOpen,
    Tag,
    Clock,
    WrenchIcon,
    Phone,
    Mail,
    Instagram,
    Linkedin,
    ExternalLink,
    RefreshCw,
} from "lucide-react"

type Settings = {
    school_name: string
    whatsapp_number: string
    instagram_url: string
    linkedin_url: string
    support_email: string
    session_max_age: string
    maintenance_mode: string
}

type Stats = {
    users: { total: number; active: number; inactive: number }
    studyLogs: { total: number }
    system: { version: string; nodeEnv: string; buildTime: string }
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, description, children }: {
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <div className="border rounded-xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="font-semibold text-sm">{title}</h2>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }: {
    icon: React.ElementType
    label: string
    value: string | number
    sub?: string
}) {
    return (
        <div className="border rounded-lg p-4 bg-background flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isStatsLoading, setIsStatsLoading] = useState(true)

    // Local form state
    const [form, setForm] = useState<Settings>({
        school_name: "",
        whatsapp_number: "",
        instagram_url: "",
        linkedin_url: "",
        support_email: "",
        session_max_age: "86400",
        maintenance_mode: "false",
    })

    const fetchSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
                setForm(data)
            }
        } catch {
            toast.error("Erro ao carregar configurações")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStats = async () => {
        setIsStatsLoading(true)
        try {
            const res = await fetch("/api/admin/settings/stats")
            if (res.ok) setStats(await res.json())
        } catch {
            toast.error("Erro ao carregar métricas")
        } finally {
            setIsStatsLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
        fetchStats()
    }, [])

    const set = (key: keyof Settings, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const saveSection = async (keys: (keyof Settings)[]) => {
        setIsSaving(true)
        try {
            const entries = keys.map((k) => ({ key: k, value: form[k] }))
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: entries }),
            })
            if (!res.ok) throw new Error()
            const updated = await res.json()
            setSettings(updated)
            setForm(updated)
            toast.success("Configurações salvas com sucesso")
        } catch {
            toast.error("Erro ao salvar configurações")
        } finally {
            setIsSaving(false)
        }
    }

    const sessionHours = Math.round(parseInt(form.session_max_age || "86400") / 3600)
    const isMaintenanceOn = form.maintenance_mode === "true"

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gerencie a identidade, segurança e monitore o estado da plataforma.
                </p>
            </div>

            {/* ── Grupo 1: Identidade ───────────────────────────────────── */}
            <Section
                icon={Building2}
                title="Identidade da Escola"
                description="Informações exibidas na plataforma e na landing page"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Building2 className="h-3 w-3" /> Nome da Escola / Curso
                            </Label>
                            <Input
                                value={form.school_name}
                                onChange={(e) => set("school_name", e.target.value)}
                                placeholder="Operação 01"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Mail className="h-3 w-3" /> Email de Suporte
                            </Label>
                            <Input
                                type="email"
                                value={form.support_email}
                                onChange={(e) => set("support_email", e.target.value)}
                                placeholder="suporte@operacao01.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Phone className="h-3 w-3" /> WhatsApp Principal
                            </Label>
                            <Input
                                value={form.whatsapp_number}
                                onChange={(e) => set("whatsapp_number", e.target.value)}
                                placeholder="+55 11 99999-9999"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Instagram className="h-3 w-3" /> Instagram (URL)
                            </Label>
                            <Input
                                value={form.instagram_url}
                                onChange={(e) => set("instagram_url", e.target.value)}
                                placeholder="https://instagram.com/operacao01"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Linkedin className="h-3 w-3" /> LinkedIn (URL)
                            </Label>
                            <Input
                                value={form.linkedin_url}
                                onChange={(e) => set("linkedin_url", e.target.value)}
                                placeholder="https://linkedin.com/in/operacao01"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            size="sm"
                            onClick={() => saveSection(["school_name", "support_email", "whatsapp_number", "instagram_url", "linkedin_url"])}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Salvar Identidade
                        </Button>
                    </div>
                </div>
            </Section>

            {/* ── Grupo 3 (parcial): Sessão & Segurança ─────────────────── */}
            <Section
                icon={Shield}
                title="Sessão e Segurança"
                description="Controle de acesso e tempo de autenticação"
            >
                <div className="space-y-6">

                    {/* Session Max Age */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Clock className="h-3 w-3" /> Tempo de Expiração de Sessão
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="3600"
                                step="3600"
                                className="w-36"
                                value={form.session_max_age}
                                onChange={(e) => set("session_max_age", e.target.value)}
                            />
                            <span className="text-sm text-muted-foreground">
                                segundos = <strong>{sessionHours}h</strong>
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70">
                            ⚠️ Alterações afetam apenas novos logins. Sessões ativas permanecem válidas até expirarem naturalmente.
                        </p>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="flex items-start justify-between gap-4 border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-start gap-3">
                            <WrenchIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Modo Manutenção</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Quando ativo, usuários não-administradores são redirecionados para a página de manutenção.
                                    Administradores continuam com acesso normal.
                                </p>
                                {isMaintenanceOn && (
                                    <Badge className="mt-2 bg-orange-500 hover:bg-orange-600 border-none text-white text-xs">
                                        🔴 SISTEMA EM MANUTENÇÃO
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Switch
                            checked={isMaintenanceOn}
                            onCheckedChange={(val: boolean) => set("maintenance_mode", val ? "true" : "false")}
                            className="mt-0.5 flex-shrink-0"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => saveSection(["session_max_age", "maintenance_mode"])}
                            disabled={isSaving}
                            className="gap-2"
                            variant={isMaintenanceOn ? "destructive" : "default"}
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Salvar Segurança
                        </Button>
                    </div>
                </div>
            </Section>

            {/* ── Grupo 4: Diagnóstico ──────────────────────────────────── */}
            <Section
                icon={BarChart3}
                title="Diagnóstico do Sistema"
                description="Métricas e informações operacionais em tempo real"
            >
                {isStatsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : stats ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard icon={Users} label="Usuários Total" value={stats.users.total} />
                            <StatCard
                                icon={Users}
                                label="Usuários Ativos"
                                value={stats.users.active}
                                sub={`${stats.users.inactive} inativos`}
                            />
                            <StatCard icon={BookOpen} label="Logs de Estudo" value={stats.studyLogs.total} />
                            <StatCard icon={Tag} label="Versão" value={`v${stats.system.version}`} sub={stats.system.nodeEnv} />
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/20 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Build / Commit</p>
                            <p className="text-sm font-mono">{stats.system.buildTime}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground"
                                onClick={fetchStats}
                            >
                                <RefreshCw className="h-3 w-3" />
                                Atualizar métricas
                            </Button>
                            <a
                                href="https://app.supabase.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Abrir painel Supabase
                            </a>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Métricas indisponíveis.</p>
                )}
            </Section>
        </div>
    )
}
