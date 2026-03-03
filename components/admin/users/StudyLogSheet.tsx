import { logger } from "@/lib/logger";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type StudyLog = {
    id: string
    date: string
    hoursStudied: number
    subject: { name: string }
    content?: { name: string }
    questionsAnswered: number
    correctAnswers: number
}

type StudyLogSheetProps = {
    userId: string
    date: string | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function StudyLogSheet({ userId, date, isOpen, onOpenChange }: StudyLogSheetProps) {
    const [logs, setLogs] = useState<StudyLog[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && date && userId) {
            // Fetch logs for this specific date
            // Note: We might need a new API endpoint or re-use existing with date filter
            // For now, let's assume we can fetch by user and filter client side or backend
            // Let's CREATE a specific endpoint for daily details or reuse
            // Actually, we can just fetch all user logs or range.
            // Implemented simplified fetch:
            const fetchLogs = async () => {
                setIsLoading(true)
                try {
                    // This endpoint doesn't exist yet specifically for date query, 
                    // but we can add query param to existing user log list or create specialized one.
                    // Let's assume /api/admin/users/[id]/logs?date=YYYY-MM-DD
                    // or /api/study-log?userId=...&date=...

                    // Mocking for now as we didn't plan this specific "Get logs by date" endpoint in detail
                    // but we can query the general logs endpoint if it supports filtering.
                    // Plan step 4 says "Build StudyLogSheet".

                    // Let's assume we use a query to existing get logs or a new one.
                    // For expedience, I'll fetch 'heatmap' data which is aggregated, so I can't get details from it.
                    // I will add a simple endpoint handler or logic here.

                    // BETTER: Let's just fetch from a new endpoint /api/admin/users/[id]/logs/[date]
                    const res = await fetch(`/api/admin/users/${userId}/logs/${date}`)
                    if (res.ok) {
                        const data = await res.json()
                        setLogs(data)
                    }
                } catch (e) {
                    logger.error(e)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchLogs()
        }
    }, [isOpen, date, userId])

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Atividade em {date ? new Date(date).toLocaleDateString() : ''}</SheetTitle>
                    <SheetDescription>
                        Detalhamento do estudo registrado neste dia.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">Carregando...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Nenhum registro neste dia.</div>
                    ) : (
                        <div className="space-y-4 pr-4">
                            {logs.map(log => (
                                <div key={log.id} className="border rounded-lg p-4 space-y-2 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{log.subject.name}</p>
                                            <p className="text-sm text-muted-foreground">{log.content?.name || "Sem conteúdo especificado"}</p>
                                        </div>
                                        <Badge variant="outline">{log.hoursStudied}h</Badge>
                                    </div>
                                    <div className="text-xs flex gap-4 text-muted-foreground">
                                        <span>Questões: {log.questionsAnswered}</span>
                                        <span>Acertos: {log.correctAnswers}</span>
                                    </div>

                                    {/* History Button Placeholder */}
                                    {/* We can check if log has history here if returned from API */}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
