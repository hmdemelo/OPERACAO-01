import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { isMasterAdmin } from "@/lib/auth/superAdmin"

const TIMEOUT_MIN = 15 // sessão sem heartbeat por 15+ min = encerrada

// GET /api/admin/access-log?page=1&limit=50&userId=xxx
// Retorna sessões paginadas com dados do usuário. Admin master only.
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isMasterAdmin(session.user)) {
        return new NextResponse("Não autorizado", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10))
    const userId = searchParams.get("userId") ?? undefined

    const where = userId ? { userId } : {}

    const [total, rows] = await Promise.all([
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
    ])

    const now = new Date()
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

    return NextResponse.json({ total, page, limit, rows: serialized })
}
