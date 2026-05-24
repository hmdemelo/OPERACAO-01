import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
    contentV2Id: z.string().min(1),
    title: z.string().min(1).max(255),
    defaultText: z.string().max(255).optional().nullable(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    try {
        const body = schema.parse(await req.json())
        const max = await prisma.topicV2.aggregate({
            where: { contentV2Id: body.contentV2Id },
            _max: { order: true },
        })
        const topic = await prisma.topicV2.create({
            data: {
                contentV2Id: body.contentV2Id,
                title: body.title,
                defaultText: body.defaultText || null,
                order: (max._max.order ?? -1) + 1,
            },
        })
        return NextResponse.json(topic)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
