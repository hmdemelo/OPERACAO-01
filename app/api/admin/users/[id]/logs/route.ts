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

    const userId = (await params).id
    const { searchParams } = new URL(req.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    if (!startDateStr || !endDateStr) {
        return new NextResponse("Missing startDate or endDate", { status: 400 })
    }

    // Force America/Sao_Paulo (UTC-3) for the entire day bounds
    // startDateStr is expected to be YYYY-MM-DD
    const start = new Date(`${startDateStr}T00:00:00.000-03:00`)
    const end = new Date(`${endDateStr}T23:59:59.999-03:00`)

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
                history: { select: { id: true } }
            },
            orderBy: {
                date: 'asc'
            }
        })

        return NextResponse.json(logs)
    } catch (error) {
        logger.error("[WEEKLY_LOGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
