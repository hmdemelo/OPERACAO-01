import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    try {
        await prisma.questionAnswer.upsert({
            where: { userId_questionId: { userId: session.user.id, questionId: id } },
            update: { answeredAt: new Date() },
            create: { userId: session.user.id, questionId: id },
        })
        return NextResponse.json({ ok: true })
    } catch (error) {
        logger.error("Mark answered failed:", error)
        return NextResponse.json({ error: "Erro ao marcar como respondida" }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    try {
        await prisma.questionAnswer.deleteMany({
            where: { userId: session.user.id, questionId: id },
        })
        return NextResponse.json({ ok: true })
    } catch (error) {
        logger.error("Unmark answered failed:", error)
        return NextResponse.json({ error: "Erro ao desmarcar" }, { status: 500 })
    }
}
