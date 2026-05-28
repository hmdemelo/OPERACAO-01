import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { isCategoryColor } from "@/lib/dashboard/visualTokens"

const putSchema = z.object({
    subjectV2Id: z.string().min(1),
    color: z.string().refine(isCategoryColor, "Cor inválida"),
})

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const prefs = await prisma.subjectColorPreference.findMany({
        where: { userId: session.user.id },
        select: { subjectV2Id: true, color: true },
    })

    return NextResponse.json(prefs)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const { subjectV2Id, color } = putSchema.parse(await req.json())

        const updated = await prisma.subjectColorPreference.upsert({
            where: { userId_subjectV2Id: { userId: session.user.id, subjectV2Id } },
            update: { color },
            create: { userId: session.user.id, subjectV2Id, color },
            select: { subjectV2Id: true, color: true },
        })

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
