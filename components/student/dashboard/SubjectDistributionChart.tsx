import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SubjectDistributionChartProps {
    subjectDistribution: any[];
    selectedSubject: string | null;
    setSelectedSubject: (subject: string | null) => void;
}

export function SubjectDistributionChart({ subjectDistribution, selectedSubject, setSelectedSubject }: SubjectDistributionChartProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Desempenho por Matéria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {subjectDistribution.map((sub: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedSubject(selectedSubject === sub.subject ? null : sub.subject)}
                            className={`w-full flex justify-between items-center p-2 rounded-md border transition-all text-left ${selectedSubject === sub.subject
                                ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                : 'bg-card hover:bg-secondary border-transparent hover:border-border'
                                }`}
                        >
                            <span className="font-medium text-sm truncate max-w-[120px]" title={sub.subject}>{sub.subject}</span>
                            <div className="text-right">
                                <div className="text-sm font-bold">{sub.totalHours.toFixed(1)}h</div>
                                <div className={`text-xs ${sub.accuracy >= 70 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    {sub.accuracy.toFixed(0)}% Prec
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
