import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { getStudyHistory } from "@/lib/metrics/studentMetrics"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoryPage({ searchParams }: Props) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const resolvedSearchParams = await searchParams; // Await searchParams as required in Next 15+
    const page = parseInt((typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : "1"))
    const subjectFilter = typeof resolvedSearchParams.subject === 'string' ? resolvedSearchParams.subject : undefined;
    const period = (typeof resolvedSearchParams.period === 'string' ? resolvedSearchParams.period : 'week') as 'week' | 'fortnight' | 'all';

    const { data: history, meta } = await getStudyHistory(session.user.id, {
        subject: subjectFilter,
        page,
        limit: 10,
        period: period,
    })

    const getPeriodLink = (p: string) => ({
        query: {
            period: p,
            page: "1",
            ...(subjectFilter ? { subject: subjectFilter } : {})
        }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Histórico de Estudos</h1>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <Link href={getPeriodLink('week')} className={`px-4 py-1 text-sm rounded-md transition-all ${period === 'week' ? 'bg-white shadow-sm font-medium text-black dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>Semana</Link>
                        <Link href={getPeriodLink('fortnight')} className={`px-4 py-1 text-sm rounded-md transition-all ${period === 'fortnight' ? 'bg-white shadow-sm font-medium text-black dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>Quinzena</Link>
                        <Link href={getPeriodLink('all')} className={`px-4 py-1 text-sm rounded-md transition-all ${period === 'all' ? 'bg-white shadow-sm font-medium text-black dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>Geral</Link>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-1">
                        Total de Registros: {meta.total}
                    </Badge>
                </div>
            </div>

            {/* Basic Filter UI could go here (form submitting to GET) */}

            <div className="rounded-md border">
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
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.date}</TableCell>
                                    <TableCell>{log.subject}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {log.topic || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.hoursStudied.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.correctAnswers}/{log.questionsAnswered}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={
                                                log.accuracy < 60 ? "text-red-500 font-bold" : "text-green-600"
                                            }
                                        >
                                            {log.accuracy.toFixed(1)}%
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center items-center space-x-4">
                {page > 1 ? (
                    <a href={`?page=${page - 1}`}>
                        <Button variant="outline">Anterior</Button>
                    </a>
                ) : (
                    <Button variant="outline" disabled>Anterior</Button>
                )}
                <span>Página {page} de {meta.totalPages}</span>
                {page < meta.totalPages ? (
                    <a href={`?page=${page + 1}`}>
                        <Button variant="outline">Próxima</Button>
                    </a>
                ) : (
                    <Button variant="outline" disabled>Próxima</Button>
                )}
            </div>
        </div>
    )
}
