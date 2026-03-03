import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DailyProgressChart({ dailyProgress }: { dailyProgress: any[] }) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Progresso Diário (Últimos 7 Dias)</CardTitle>
            </CardHeader>
            <CardContent>
                {dailyProgress.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum dado recente.</p>
                ) : (
                    <div className="space-y-4">
                        {dailyProgress.map((day: any) => (
                            <div key={day.date} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-medium text-muted-foreground">{day.date.split('-').slice(1).reverse().join('/')}</div>
                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${Math.min((day.hours / 4) * 100, 100)}%` }} // Cap at 4h visual max
                                    />
                                </div>
                                <div className="w-24 text-right text-sm font-bold">{day.hours.toFixed(1)}h</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
