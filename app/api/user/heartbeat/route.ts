import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings"

// POST /api/user/heartbeat
// Chamado pelo HeartbeatEmitter a cada 10 min enquanto a aba está ativa.
// Atualiza lastSeenAt da sessão aberta mais recente do usuário.
// Aproveita a chamada para limpar sessões com mais de 90 dias (1% das vezes).
export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse(null, { status: 401 })

    const enabled = await getSetting("tracking_enabled")
    if (enabled === "false") return new NextResponse(null, { status: 204 })

    const now = new Date()

    await prisma.userSession.updateMany({
        where: { userId: session.user.id, logoutAt: null },
        data: { lastSeenAt: now },
    })

    // Limpeza probabilística: ~1% das chamadas remove sessões com mais de 90 dias
    if (Math.random() < 0.01) {
        const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        await prisma.userSession.deleteMany({ where: { loginAt: { lt: cutoff } } })
    }

    return new NextResponse(null, { status: 204 })
}
