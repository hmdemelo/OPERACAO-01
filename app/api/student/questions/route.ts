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

    const plan = await prisma.weeklyPlan.findUnique({
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
    })

    if (!plan) {
        return NextResponse.json({ questions: [] })
    }

    const subjectIds = Array.from(
        new Set(plan.items.map((i) => i.subjectId).filter((id): id is string => !!id))
    )

    if (subjectIds.length === 0) {
        return NextResponse.json({ questions: [] })
    }

    const questions = await prisma.question.findMany({
        where: {
            status: "APPROVED",
            subjectId: { in: subjectIds },
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
        },
        orderBy: [
            { subject: { name: "asc" } },
            { createdAt: "desc" },
        ],
    })

    return NextResponse.json({ questions })
}
