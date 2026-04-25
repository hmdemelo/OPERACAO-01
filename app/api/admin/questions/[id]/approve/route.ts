import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { enrichQuestion } from "@/lib/ai/questionAnalyzer"
import { canReviewQuestion } from "@/lib/auth/questionPermissions"
import { logger } from "@/lib/logger"

export const maxDuration = 60

export async function POST(
    req: Request,
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
        const body = await req.json().catch(() => ({}))
        const { subjectId, contentId } = body as { subjectId?: string | null; contentId?: string | null }

        const existing = await prisma.question.findUnique({
            where: { id },
            select: { stem: true, alternatives: true },
        })
        if (!existing) {
            return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 })
        }

        const alternatives = existing.alternatives as Record<string, string>
        const enriched = await enrichQuestion(existing.stem, alternatives)

        const updated = await prisma.question.update({
            where: { id },
            data: {
                status: "APPROVED",
                correctAnswer: enriched.correctAnswer,
                commentary: enriched.commentary,
                approvedAt: new Date(),
                approvedById: session.user.id,
                ...(subjectId !== undefined && { subjectId: subjectId || null }),
                ...(contentId !== undefined && { contentId: contentId || null }),
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        logger.error("Question approve failed:", error)
        const message = error instanceof Error ? error.message : "Erro ao aprovar questão"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
