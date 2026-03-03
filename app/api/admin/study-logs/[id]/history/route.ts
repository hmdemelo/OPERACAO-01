import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const logId = (await params).id

    try {
        const history = await prisma.studyLogHistory.findMany({
            where: {
                studyLogId: logId
            },
            include: {
                changedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                changedAt: 'desc'
            }
        })

        return NextResponse.json(history)
    } catch (error) {
        logger.error("[STUDYLOG_HISTORY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
