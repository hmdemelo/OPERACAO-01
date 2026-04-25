import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { showAnsweredQuestions: true },
    })

    return NextResponse.json({
        showAnsweredQuestions: user?.showAnsweredQuestions ?? false,
    })
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { showAnsweredQuestions } = body as { showAnsweredQuestions?: boolean }

        if (typeof showAnsweredQuestions !== "boolean") {
            return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { showAnsweredQuestions },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        logger.error("Update preferences failed:", error)
        return NextResponse.json({ error: "Erro ao salvar preferências" }, { status: 500 })
    }
}
