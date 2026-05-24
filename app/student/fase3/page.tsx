import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Fase3View } from "@/components/student/grade/Fase3View"

export default async function Fase3Page() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

    const simulations = await prisma.simulation.findMany({
        where: { grid: { userId: session.user.id } },
        orderBy: { date: "desc" },
        include: {
            blocks: {
                include: {
                    studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                },
            },
        },
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Fase 3</h1>
                <p className="text-muted-foreground text-sm">Simulados — preencha suas anotações e resultados.</p>
            </div>
            <Fase3View initialSimulations={simulations} />
        </div>
    )
}
