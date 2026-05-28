import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { getMentorIdFilter } from "@/lib/auth/superAdmin"
import { getV2StudentRows, summarizeV2Fleet } from "@/lib/metrics/v2Metrics"
import { V2FunilKpis } from "@/components/admin/v2/dashboard/V2FunilKpis"
import { V2FunilByStudentChart } from "@/components/admin/v2/dashboard/V2FunilByStudentChart"
import { V2SimulationTrendChart } from "@/components/admin/v2/dashboard/V2SimulationTrendChart"
import { V2StudentTable } from "@/components/admin/v2/dashboard/V2StudentTable"

export default async function V2DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/signin")
    if (!["ADMIN", "MENTOR"].includes(session.user.role)) redirect("/student/dashboard")

    const mentorId = getMentorIdFilter({
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
    })

    const { rows, trendsByStudent } = await getV2StudentRows(mentorId)
    const summary = summarizeV2Fleet(rows)

    return (
        <div className="w-full max-w-[1600px] space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics V2</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Funil de 3 fases: grade concluída → cadernos de erros → simulados.
                </p>
            </div>

            <V2FunilKpis
                studentsTotal={summary.studentsTotal}
                studentsWithGrid={summary.studentsWithGrid}
                fase1Avg={summary.fase1Avg}
                fase2Avg={summary.fase2Avg}
                fase3Avg={summary.fase3Avg}
                transferGapCount={summary.transferGapCount}
            />

            <V2FunilByStudentChart students={rows} />

            <V2SimulationTrendChart students={rows} trendsByStudent={trendsByStudent} />

            <V2StudentTable students={rows} />
        </div>
    )
}
