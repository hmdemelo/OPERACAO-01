"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

import { useDashboardFilter } from "@/hooks/useDashboardFilter"
import { PerformanceStats } from "./dashboard/PerformanceStats"
import { DailyProgressChart } from "./dashboard/DailyProgressChart"
import { SubjectDistributionChart } from "./dashboard/SubjectDistributionChart"
import { HistoryTable } from "./dashboard/HistoryTable"

import { useStudentStore } from "@/store/useStudentStore"
import { useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"

interface DashboardContainerProps {
    initialData?: {
        weeklySummary: any
        dailyProgress: any[]
        subjectDistribution: any[]
        fullHistory: any[]
    }
}

export function DashboardContainer({
    initialData
}: DashboardContainerProps) {
    const {
        dashboardData,
        setDashboardData,
        isLoadingDashboard,
        setLoadingDashboard,
        lastDashboardFetch
    } = useStudentStore()

    const loadData = useCallback(async () => {
        // If we have initial data (from server) and no data in store, use initial
        if (initialData && !dashboardData) {
            setDashboardData(initialData)
            return
        }

        // Check if we need to fetch (if no data or if it's more than 5 minutes old)
        const fiveMinutes = 5 * 60 * 1000
        const isStale = lastDashboardFetch && (Date.now() - lastDashboardFetch > fiveMinutes)

        if (!dashboardData || isStale) {
            setLoadingDashboard(true)
            try {
                const res = await fetch('/api/student/dashboard')
                if (res.ok) {
                    const data = await res.json()
                    setDashboardData(data)
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setLoadingDashboard(false)
            }
        }
    }, [initialData, dashboardData, lastDashboardFetch, setDashboardData, setLoadingDashboard])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Use current data from store or initial data as fallback
    const currentData = dashboardData || initialData

    const {
        selectedSubject,
        setSelectedSubject,
        clearFilter,
        filteredHistory,
        filteredSummary
    } = useDashboardFilter(
        currentData?.weeklySummary || {},
        currentData?.fullHistory || []
    );

    if (isLoadingDashboard && !currentData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Atualizando seus dados de performance...</p>
            </div>
        )
    }

    if (!currentData) return null;

    const { dailyProgress, subjectDistribution } = currentData;

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
