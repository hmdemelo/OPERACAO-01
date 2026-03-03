import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string, date: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = (await params).id
    const dateStr = (await params).date

    if (!dateStr) return new NextResponse("Date required", { status: 400 })

    const start = new Date(dateStr)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateStr)
    end.setHours(23, 59, 59, 999)

    try {
        const logs = await prisma.studyLog.findMany({
            where: {
                userId: userId,
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                subject: { select: { name: true } },
                content: { select: { name: true } },
                history: { select: { id: true } } // Just check existence
            }
        })

        return NextResponse.json(logs)
    } catch (error) {
        logger.error("[DAILY_LOGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
