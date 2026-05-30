import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings"

// POST /api/user/heartbeat
// Chamado pelo HeartbeatEmitter a cada 10 min enquanto a aba está ativa.
// Atualiza lastSeenAt da sessão aberta mais recente do usuário.
// O evento signIn do NextAuth não expõe o request, então capturamos
// ipAddress/userAgent aqui — o primeiro heartbeat dispara logo após o login.
// Aproveita a chamada para limpar sessões com mais de 90 dias (1% das vezes).
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse(null, { status: 401 })

    const enabled = await getSetting("tracking_enabled")
    if (enabled === "false") return new NextResponse(null, { status: 204 })

    // Sem sessionId no token não há o que atualizar (tracking estava off no login).
    const sessionId = session.sessionId
    if (!sessionId) return new NextResponse(null, { status: 204 })

    const now = new Date()

    const ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        null
    const userAgent = req.headers.get("user-agent")?.slice(0, 255) ?? null

    // Atualiza apenas ESTA sessão (não todas as abertas do usuário). ip/userAgent
    // são preenchidos só enquanto nulos — captura o contexto do login no primeiro
    // heartbeat sem reescrever depois.
    await prisma.userSession.updateMany({
        where: { id: sessionId, logoutAt: null },
        data: { lastSeenAt: now },
    })

    if (ipAddress || userAgent) {
        await prisma.userSession.updateMany({
            where: { id: sessionId, logoutAt: null, ipAddress: null },
            data: { ipAddress, userAgent },
        })
    }

    // Limpeza probabilística: ~1% das chamadas remove sessões com mais de 90 dias
    if (Math.random() < 0.01) {
        const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        await prisma.userSession.deleteMany({ where: { loginAt: { lt: cutoff } } })
    }

    return new NextResponse(null, { status: 204 })
}
