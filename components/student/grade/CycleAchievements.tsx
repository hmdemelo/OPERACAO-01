import Link from "next/link"
import { Trophy } from "lucide-react"

type Achievement = {
    id: string
    cycleNumber: number
    cycleLabel: string
    completedAt: string | null
    pct: number
    done: number
    total: number
}

function formatDate(iso: string | null) {
    if (!iso) return null
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

export function CycleAchievements({ achievements }: { achievements: Achievement[] }) {
    return (
        <aside className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Ciclos anteriores
            </div>
            {achievements.map((a) => (
                <Link
                    key={a.id}
                    href={`/student/fase1/ciclo/${a.id}`}
                    className="block rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/50 hover:bg-muted/30"
                >
                    <p className="text-sm font-semibold leading-tight">
                        Ciclo {a.cycleNumber} — {a.cycleLabel}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${a.pct}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">
                            {a.pct}%
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {a.done}/{a.total} tópicos
                        {a.completedAt && ` · concluído em ${formatDate(a.completedAt)}`}
                    </p>
                </Link>
            ))}
        </aside>
    )
}
