import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { isMasterAdmin } from "@/lib/auth/superAdmin"
import { formatToDatabaseDate } from "@/lib/date-utils"
import type { Prisma } from "@prisma/client"

const TIMEOUT_MIN = 15 // sessão sem heartbeat por 15+ min = encerrada

// GET /api/admin/access-log?page=1&limit=50&userId=xxx&q=texto
// Retorna sessões paginadas + KPIs agregados sobre toda a base (não só a página).
// Admin master only.
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isMasterAdmin(session.user)) {
        return new NextResponse("Não autorizado", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10))
    const userId = searchParams.get("userId") ?? undefined
    const q = searchParams.get("q")?.trim() ?? ""

    const where: Prisma.UserSessionWhereInput = {}
    if (userId) where.userId = userId
    if (q) {
        where.user = {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
            ],
        }
    }

    const now = new Date()
    const activeCutoff = new Date(now.getTime() - TIMEOUT_MIN * 60 * 1000)
    const startOfToday = formatToDatabaseDate(now)

    const [total, rows, activeUsers, sessionsToday, durationAgg] = await Promise.all([
        prisma.userSession.count({ where }),
        prisma.userSession.findMany({
            where,
            orderBy: { loginAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                loginAt: true,
                logoutAt: true,
                lastSeenAt: true,
                durationMin: true,
                ipAddress: true,
                userAgent: true,
                user: { select: { id: true, name: true, email: true, role: true } },
            },
        }),
        // "Ativos agora" = pessoas distintas online (mesmo usuário com várias
        // abas abertas conta uma vez). Calculado sobre toda a base filtrada.
        prisma.userSession.groupBy({
            by: ["userId"],
            where: { ...where, logoutAt: null, lastSeenAt: { gte: activeCutoff } },
        }),
        prisma.userSession.count({
            where: { ...where, loginAt: { gte: startOfToday } },
        }),
        // Duração média apenas de sessões encerradas (com durationMin gravado),
        // evitando que abas abertas por horas distorçam o número.
        prisma.userSession.aggregate({
            where: { ...where, durationMin: { not: null } },
            _avg: { durationMin: true },
        }),
    ])

    const serialized = rows.map((r) => {
        const isActive = !r.logoutAt && (now.getTime() - r.lastSeenAt.getTime()) < TIMEOUT_MIN * 60 * 1000
        const duration = r.durationMin
            ?? (r.logoutAt
                ? Math.round((r.logoutAt.getTime() - r.loginAt.getTime()) / 60000)
                : Math.round((r.lastSeenAt.getTime() - r.loginAt.getTime()) / 60000))
        return {
            id: r.id,
            userId: r.user.id,
            userName: r.user.name,
            userEmail: r.user.email,
            userRole: r.user.role,
            loginAt: r.loginAt.toISOString(),
            logoutAt: r.logoutAt?.toISOString() ?? null,
            lastSeenAt: r.lastSeenAt.toISOString(),
            durationMin: duration,
            isActive,
            ipAddress: r.ipAddress,
            userAgent: r.userAgent,
        }
    })

    return NextResponse.json({
        total,
        page,
        limit,
        rows: serialized,
        stats: {
            activeNow: activeUsers.length,
            sessionsToday,
            total,
            avgDurationMin: Math.round(durationAgg._avg.durationMin ?? 0),
        },
    })
}
