import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceStatsProps {
    filteredSummary: any;
    selectedSubject: string | null;
}

export function PerformanceStats({ filteredSummary, selectedSubject }: PerformanceStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Horas Estudadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{filteredSummary.totalHours?.toFixed(2) || '0.00'}h</div>
                    <p className="text-xs text-muted-foreground">
                        {selectedSubject ? "Filtrado por matéria" : "Total acumulado"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Questões</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{filteredSummary.totalQuestions || 0}</div>
                    <p className="text-xs text-muted-foreground">Resolvidas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Precisão</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${filteredSummary.accuracy >= 70 ? 'text-green-600' : filteredSummary.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {(filteredSummary.accuracy || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Taxa de acerto</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessões</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{filteredSummary.logCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Registros</p>
                </CardContent>
            </Card>
        </div>
    )
}
