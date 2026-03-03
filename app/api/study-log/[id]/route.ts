import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"


const updateLogSchema = z.object({
    hoursStudied: z.number().min(0).optional(),
    date: z.string().optional(), // Date string YYYY-MM-DD
    // Add other fields if editable
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const logId = (await params).id

    try {
        const json = await req.json()
        const body = updateLogSchema.parse(json)

        // 1. Fetch current state
        const originalLog = await prisma.studyLog.findUnique({
            where: { id: logId }
        })

        if (!originalLog) {
            return new NextResponse("Log not found", { status: 404 })
        }

        // 2. Update Log
        const updatedLog = await prisma.studyLog.update({
            where: { id: logId },
            data: {
                hoursStudied: body.hoursStudied,
                date: body.date ? new Date(body.date) : undefined
            }
        })

        // 3. Record History
        await prisma.studyLogHistory.create({
            data: {
                studyLogId: logId,
                previousValues: originalLog as any,
                newValues: updatedLog as any,
                changedById: session.user.id
            }
        })

        return NextResponse.json(updatedLog)

    } catch (error) {
        logger.error("[STUDYLOG_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
