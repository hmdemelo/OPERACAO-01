import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({ name: z.string().min(1).max(100) })

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const body = schema.parse(await req.json())
        const max = await prisma.subjectV2.aggregate({ _max: { order: true } })
        const subject = await prisma.subjectV2.create({
            data: { name: body.name, order: (max._max.order ?? -1) + 1 },
            include: { contents: { include: { topics: true } } },
        })
        return NextResponse.json(subject)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
