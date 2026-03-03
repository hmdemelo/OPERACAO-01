
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const assignConcursosSchema = z.object({
    concursoIds: z.array(z.string()),
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()
        const { concursoIds } = assignConcursosSchema.parse(json)
        const { id: userId } = await params

        // Use transaction to replace assignments
        await prisma.$transaction([
            prisma.userConcurso.deleteMany({
                where: { userId },
            }),
            prisma.userConcurso.createMany({
                data: concursoIds.map((concursoId) => ({
                    userId,
                    concursoId,
                })),
            }),
        ])

        return new NextResponse("Concursos assigned", { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[USER_CONCURSOS_POST]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
