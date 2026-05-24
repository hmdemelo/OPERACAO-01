import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Não autorizado", { status: 401 })

    const grid = await prisma.studyGrid.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    })
    if (!grid) return NextResponse.json([])

    const simulations = await prisma.simulation.findMany({
        where: { gridId: grid.id },
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
