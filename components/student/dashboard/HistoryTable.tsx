import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

interface HistoryTableProps {
    filteredHistory: any[];
    selectedSubject: string | null;
}

export function HistoryTable({ filteredHistory, selectedSubject }: HistoryTableProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico Detalhado</CardTitle>
                {selectedSubject && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtrando por: <span className="font-semibold text-primary">{selectedSubject}</span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Matéria</TableHead>
                            <TableHead>Tópico</TableHead>
                            <TableHead className="text-right">Horas</TableHead>
                            <TableHead className="text-right">Questões</TableHead>
                            <TableHead className="text-right">Precisão</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    Nenhum registro encontrado para este filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHistory.slice(0, 10).map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.date}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedSubject === log.subject
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-secondary text-secondary-foreground'
                                            }`}>
                                            {log.subject}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={log.topic}>
                                        {log.topic}
                                    </TableCell>
                                    <TableCell className="text-right">{log.hoursStudied?.toFixed(1) || '0.0'}</TableCell>
                                    <TableCell className="text-right">
                                        {log.correctAnswers || 0}/{log.questionsAnswered || 0}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        <span className={(log.accuracy || 0) < 60 ? "text-red-500" : "text-green-600"}>
                                            {(log.accuracy || 0).toFixed(0)}%
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {filteredHistory.length > 10 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground pt-4">
                                    Exibindo os 10 registros mais recentes de {filteredHistory.length}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
