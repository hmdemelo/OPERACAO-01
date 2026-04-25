import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { canReviewQuestion } from "@/lib/auth/questionPermissions"
import { logger } from "@/lib/logger"

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const permission = await canReviewQuestion(session.user, id)
    if (!permission.allowed) {
        return NextResponse.json(
            { error: permission.reason || "Sem permissão" },
            { status: 403 },
        )
    }

    try {
        const updated = await prisma.question.update({
            where: { id },
            data: { status: "REJECTED" },
        })
        return NextResponse.json(updated)
    } catch (error) {
        logger.error("Question reject failed:", error)
        return NextResponse.json({ error: "Erro ao rejeitar questão" }, { status: 500 })
    }
}
