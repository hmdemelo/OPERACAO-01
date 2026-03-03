import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { studyLogSchema } from "@/lib/validators/studyLog"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return new NextResponse("Não autorizado", { status: 401 })
        }

        const body = await req.json()

        const result = studyLogSchema.safeParse(body)

        if (!result.success) {
            return new NextResponse(JSON.stringify(result.error.issues), { status: 422 })
        }

        const {
            date,
            hoursStudied,
            questionsAnswered,
            correctAnswers,
            subjectId,
            contentId,
            topic
        } = result.data

        // Optional: Verify subject exists and user has access? 
        // For now, rely on schema CUID valid format and database constraint.

        const log = await prisma.studyLog.create({
            data: {
                userId: session.user.id,
                date: new Date(new Date(date).setHours(0, 0, 0, 0)),
                hoursStudied,
                questionsAnswered,
                correctAnswers,
                subjectId,
                contentId: contentId || null,
                topic: topic || null,
            },
        })

        return NextResponse.json(log)
    } catch (error) {
        logger.error("[STUDY_LOG_POST]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
