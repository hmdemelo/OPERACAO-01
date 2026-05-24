import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

// Job de retenção LGPD: remove entradas de StudyLogHistory mais antigas que 24 meses.
// Protegido por CRON_SECRET para ser chamado por Vercel Cron ou similar.
const RETENTION_MONTHS = 24

function isAuthorized(req: Request): boolean {
    const secret = process.env.CRON_SECRET
    if (!secret) return false
    const header = req.headers.get("authorization")
    return header === `Bearer ${secret}`
}

async function runCleanup() {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS)

    const result = await prisma.studyLogHistory.deleteMany({
        where: { changedAt: { lt: cutoff } },
    })

    logger.info("[CLEANUP_HISTORY]", {
        cutoff: cutoff.toISOString(),
        removed: result.count,
        timestamp: new Date().toISOString(),
    })

    return {
        removed: result.count,
        cutoff: cutoff.toISOString(),
        retentionMonths: RETENTION_MONTHS,
    }
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    try {
        return NextResponse.json(await runCleanup())
    } catch (error) {
        logger.error("[CLEANUP_HISTORY]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    try {
        return NextResponse.json(await runCleanup())
    } catch (error) {
        logger.error("[CLEANUP_HISTORY]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
