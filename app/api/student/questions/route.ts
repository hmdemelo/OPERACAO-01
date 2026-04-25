import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { getAraguainaStartOfWeek } from "@/lib/date-utils"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const weekStart = getAraguainaStartOfWeek(new Date())

    const [user, plan] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { showAnsweredQuestions: true },
        }),
        prisma.weeklyPlan.findUnique({
            where: {
                userId_startDate: {
                    userId: session.user.id,
                    startDate: weekStart,
                },
            },
            select: {
                items: {
                    select: { subjectId: true },
                },
            },
        }),
    ])

    if (!plan) {
        return NextResponse.json({ questions: [], showAnsweredQuestions: user?.showAnsweredQuestions ?? false })
    }

    const subjectIds = Array.from(
        new Set(plan.items.map((i) => i.subjectId).filter((id): id is string => !!id))
    )

    if (subjectIds.length === 0) {
        return NextResponse.json({ questions: [], showAnsweredQuestions: user?.showAnsweredQuestions ?? false })
    }

    const showAnswered = user?.showAnsweredQuestions ?? false

    const questions = await prisma.question.findMany({
        where: {
            status: "APPROVED",
            subjectId: { in: subjectIds },
            ...(showAnswered ? {} : { answers: { none: { userId: session.user.id } } }),
        },
        select: {
            id: true,
            externalCode: true,
            stem: true,
            alternatives: true,
            correctAnswer: true,
            commentary: true,
            source: true,
            year: true,
            subject: { select: { id: true, name: true } },
            content: { select: { id: true, name: true } },
            answers: {
                where: { userId: session.user.id },
                select: { id: true },
                take: 1,
            },
        },
        orderBy: [
            { subject: { name: "asc" } },
            { createdAt: "desc" },
        ],
    })

    const enriched = questions.map((q) => ({
        ...q,
        answered: q.answers.length > 0,
        answers: undefined,
    }))

    return NextResponse.json({
        questions: enriched,
        showAnsweredQuestions: showAnswered,
    })
}
