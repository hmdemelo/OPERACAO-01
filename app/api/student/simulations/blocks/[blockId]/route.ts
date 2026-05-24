import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const patchSchema = z.object({
    studentNotes: z.string().max(500).nullable().optional(),
    studentResult: z.string().max(50).nullable().optional(),
})

export async function PATCH(req: Request, props: { params: Promise<{ blockId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Não autorizado", { status: 401 })

    const { blockId } = await props.params

    const sb = await prisma.simulationBlock.findUnique({
        where: { id: blockId },
        include: { simulation: { include: { grid: { select: { userId: true } } } } },
    })

    if (!sb || sb.simulation.grid.userId !== session.user.id) {
        return new NextResponse("Não encontrado ou acesso negado", { status: 404 })
    }

    const body = patchSchema.parse(await req.json())
    const updated = await prisma.simulationBlock.update({
        where: { id: blockId },
        data: body,
    })

    return NextResponse.json(updated)
}
