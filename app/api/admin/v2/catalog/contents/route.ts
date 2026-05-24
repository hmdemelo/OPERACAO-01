import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
    subjectV2Id: z.string().min(1),
    name: z.string().min(1).max(100),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    try {
        const body = schema.parse(await req.json())
        const max = await prisma.contentV2.aggregate({
            where: { subjectV2Id: body.subjectV2Id },
            _max: { order: true },
        })
        const content = await prisma.contentV2.create({
            data: { ...body, order: (max._max.order ?? -1) + 1 },
            include: { topics: true },
        })
        return NextResponse.json(content)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
