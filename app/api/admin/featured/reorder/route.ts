
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateOrderSchema = z.array(z.object({
    id: z.string(),
    order: z.number().int()
}))

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const updates = updateOrderSchema.parse(json)

        await prisma.$transaction(
            updates.map(({ id, order }) =>
                prisma.featuredStudent.update({
                    where: { id },
                    data: { order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error(error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
