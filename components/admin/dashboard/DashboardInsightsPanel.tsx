"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, CheckCircle2, UserX, TrendingDown, Gauge, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type AlertStudent = {
    id: string
    name: string
    accuracy: number
    totalQuestions: number
    totalHours: number
}

interface RiskAlert {
    studentId: string
    studentName: string
    reasons: string[]
}

type DashboardInsightsPanelProps = {
    zeroActivity: AlertStudent[]
    lowAccuracy: AlertStudent[]
    lowActivity: AlertStudent[]
}

function AlertGroup({
    title,
    students,
    icon,
    bgColor,
    borderColor,
    textColor,
    renderDetail,
}: {
    title: string
    students: AlertStudent[]
    icon: React.ReactNode
    bgColor: string
    borderColor: string
    textColor: string
    renderDetail: (s: AlertStudent) => string
}) {
    if (students.length === 0) return null

    return (
        <div className={`rounded-lg border ${borderColor} ${bgColor} p-3`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className={`text-sm font-semibold ${textColor}`}>
                    {title} ({students.length})
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                    <Link
                        key={s.id}
                        href={`/admin/users/${s.id}`}
                        prefetch={false}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-background/80 hover:bg-background transition-colors ${textColor} font-medium`}
                    >
                        {s.name}
                        <span className="text-muted-foreground font-normal">
                            {renderDetail(s)}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export function DashboardInsightsPanel({
    zeroActivity,
    lowAccuracy,
    lowActivity,
}: DashboardInsightsPanelProps) {
    const [alerts, setAlerts] = useState<RiskAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const totalPeriodAlerts = zeroActivity.length + lowAccuracy.length + lowActivity.length

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await fetch("/api/admin/alerts")
                if (!res.ok) {
                    throw new Error("Falha ao buscar alertas")
                }
                const data = await res.json()
                setAlerts(data)
            } catch {
                // ignore gracefully
            } finally {
                setIsLoading(false)
            }
        }
        fetchAlerts()
    }, [])

    if (totalPeriodAlerts === 0 && !isLoading && alerts.length === 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Nenhum alerta crítico ou do período encontrado. Turma com ótima saúde!
                </span>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-bold">Central de Inteligência (Alertas)</h2>
                </div>
            </div>

            <Tabs defaultValue="predictive" className="w-full">
                <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="predictive" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Risco Iminente
                            {alerts.length > 0 && (
                                <span className="ml-1 rounded-full bg-red-100 text-red-600 px-2 text-xs font-bold dark:bg-red-900 dark:text-red-300">
                                    {alerts.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="period" className="flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            Alertas no Período
                            {totalPeriodAlerts > 0 && (
                                <span className="ml-1 rounded-full bg-amber-100 text-amber-600 px-2 text-xs font-bold dark:bg-amber-900 dark:text-amber-300">
                                    {totalPeriodAlerts}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4">
                    <TabsContent value="predictive" className="mt-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-6 text-muted-foreground">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Carregando análise preditiva avançada...
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 py-4 flex items-center justify-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Nenhum aluno detectado em risco iminente de evasão.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {alerts.map((alert) => (
                                    <Alert key={alert.studentId} className="border-amber-500/50 bg-amber-500/10 dark:bg-amber-900/10">
                                        <AlertTitle className="font-semibold text-amber-700 dark:text-amber-500">
                                            {alert.studentName}
                                        </AlertTitle>
                                        <AlertDescription className="mt-2 space-y-1">
                                            {alert.reasons.map((reason, idx) => (
                                                <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <span className="text-amber-500/80">•</span>
                                                    <span>{reason}</span>
                                                </div>
                                            ))}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="period" className="mt-0">
                        {totalPeriodAlerts === 0 ? (
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 py-4 flex items-center justify-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Nenhum ponto de atenção identificado neste período letivo.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AlertGroup
                                    title="Sem atividade no período"
                                    students={zeroActivity}
                                    icon={<UserX className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                    bgColor="bg-red-50/50 dark:bg-red-950/20"
                                    borderColor="border-red-200 dark:border-red-800"
                                    textColor="text-red-700 dark:text-red-300"
                                    renderDetail={() => "0h · 0 questões"}
                                />
                                <AlertGroup
                                    title="Precisão abaixo do esperado"
                                    students={lowAccuracy}
                                    icon={<TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                                    bgColor="bg-amber-50/50 dark:bg-amber-950/20"
                                    borderColor="border-amber-200 dark:border-amber-800"
                                    textColor="text-amber-700 dark:text-amber-300"
                                    renderDetail={(s) => `${s.accuracy.toFixed(0)}%`}
                                />
                                <AlertGroup
                                    title="Volume de atividade baixo"
                                    students={lowActivity}
                                    icon={<Gauge className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                                    bgColor="bg-orange-50/50 dark:bg-orange-950/20"
                                    borderColor="border-orange-200 dark:border-orange-800"
                                    textColor="text-orange-700 dark:text-orange-300"
                                    renderDetail={(s) => `${s.totalQuestions} questões`}
                                />
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
