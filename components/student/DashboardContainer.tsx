"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

import { useDashboardFilter } from "@/hooks/useDashboardFilter"
import { PerformanceStats } from "./dashboard/PerformanceStats"
import { DailyProgressChart } from "./dashboard/DailyProgressChart"
import { SubjectDistributionChart } from "./dashboard/SubjectDistributionChart"
import { HistoryTable } from "./dashboard/HistoryTable"

interface DashboardContainerProps {
    weeklySummary: any
    dailyProgress: any[]
    subjectDistribution: any[]
    fullHistory: any[]
}

export function DashboardContainer({
    weeklySummary,
    dailyProgress,
    subjectDistribution,
    fullHistory
}: DashboardContainerProps) {
    const {
        selectedSubject,
        setSelectedSubject,
        clearFilter,
        filteredHistory,
        filteredSummary
    } = useDashboardFilter(weeklySummary, fullHistory);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Centro de Performance</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Bem-vindo(a) ao seu painel! Aqui é onde você visualiza seus avanços, métricas e histórico de estudos.</p>
                </div>
                {selectedSubject && (
                    <Button
                        variant="outline"
                        onClick={clearFilter}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                        Limpar Filtro: <span className="font-semibold text-primary">{selectedSubject}</span>
                    </Button>
                )}
            </div>

            <PerformanceStats
                filteredSummary={filteredSummary}
                selectedSubject={selectedSubject}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <DailyProgressChart dailyProgress={dailyProgress} />

                <SubjectDistributionChart
                    subjectDistribution={subjectDistribution}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                />
            </div>

            <HistoryTable
                filteredHistory={filteredHistory}
                selectedSubject={selectedSubject}
            />
        </div>
    )
}
