import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import WeeklyPlanView from "@/components/student/WeeklyPlanView"

export default async function StudentWeeklyPlanPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <div>Acesso negado</div>
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Meu Cronograma Semanal</h1>
            <WeeklyPlanView />
        </div>
    )
}
