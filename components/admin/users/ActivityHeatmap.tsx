import React, { Fragment } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type HeatmapData = {
    date: string
    totalHours: number
    logCount: number
}

type ActivityHeatmapProps = {
    data: HeatmapData[]
    year?: number
    onSquareClick?: (date: string) => void
    days?: number
    compact?: boolean
}

export function ActivityHeatmap({
    data,
    year = new Date().getFullYear(),
    onSquareClick,
    days = 365,
    compact = false
}: ActivityHeatmapProps) {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (days - 1)) // view last N days

    // Generate array of dates
    const dates: Date[] = []
    let current = new Date(startDate)
    while (current <= today) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }

    const getColor = (hours: number) => {
        if (hours === 0) return "bg-gray-100 dark:bg-gray-800"
        if (hours < 2) return "bg-green-200 dark:bg-green-900/40"
        if (hours < 4) return "bg-green-400 dark:bg-green-700"
        return "bg-green-600 dark:bg-green-500"
    }

    const getDataForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]
        return data.find(d => d.date.startsWith(dateStr))
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex pb-2">
                <TooltipProvider>
                    <div className="flex flex-wrap gap-1 w-full">
                        {dates.map((date, index) => {
                            const dData = getDataForDate(date)
                            const hours = dData?.totalHours || 0
                            const isMonday = date.getDay() === 1
                            return (
                                <Fragment key={date.toISOString()}>
                                    {isMonday && index !== 0 && (
                                        <div className={`w-[2px] bg-orange-500 rounded-full mx-[1px] ${compact ? 'h-2' : 'h-3'}`} />
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`${compact ? 'w-2 h-2 rounded-[1px]' : 'w-3 h-3 rounded-sm'} ${getColor(hours)} cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-1`}
                                                onClick={() => onSquareClick?.(date.toISOString().split('T')[0])}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs">
                                                <p className="font-bold">{date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                                                <p>{hours.toFixed(1)} horas</p>
                                                {dData?.logCount ? <p>{dData.logCount} registros</p> : null}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </Fragment>
                            )
                        })}
                    </div>
                </TooltipProvider>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Menos</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <span>Mais</span>
            </div>
        </div>
    )
}
