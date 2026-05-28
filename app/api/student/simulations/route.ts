import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Não autorizado", { status: 401 })

    const simulations = await prisma.simulation.findMany({
        where: { grid: { userId: session.user.id, active: true } },
        orderBy: { date: "desc" },
        include: {
            blocks: {
                include: {
                    studyBlock: { include: { subjectV2: { select: { id: true, name: true } } } },
                },
            },
        },
    })

    return NextResponse.json(simulations)
}
