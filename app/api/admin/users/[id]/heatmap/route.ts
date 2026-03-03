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

    // Wrap in Promise for async params support if NextJS version requires it, but standard params works here
    // However, in latest NextJS app router, params is a promise sometimes. 
    // Types above are "classic" but let's assume params is usable.
    // Parse query params properly
    const url = new URL(req.url)
    const daysParam = url.searchParams.get("days")
    const days = daysParam ? parseInt(daysParam) : 365

    // Await params
    const userId = (await params).id

    // Calculate start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
        const logs = await prisma.studyLog.groupBy({
            by: ['date'],
            where: {
                userId: userId,
                date: {
                    gte: startDate
                }
            },
            _sum: {
                hoursStudied: true,
            },
            _count: {
                id: true
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Format for heatmap
        const heatmapData = logs.map(log => ({
            date: log.date.toISOString().split('T')[0],
            totalHours: log._sum.hoursStudied || 0,
            logCount: log._count.id
        }))

        return NextResponse.json(heatmapData)
    } catch (error) {
        logger.error("[HEATMAP_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
