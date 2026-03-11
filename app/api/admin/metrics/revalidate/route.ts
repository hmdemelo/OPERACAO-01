import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { revalidateTag } from "next/cache"
import { logger } from "@/lib/logger"

export async function POST() {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Drop the 1-hour cache strictly for admin dashboard metrics
        revalidateTag("admin-metrics")

        logger.info(`Admin metrics cache manually revalidated by ${session.user.email || session.user.id}`)

        return NextResponse.json({
            success: true,
            message: "Cache de métricas invalidado com sucesso. Novas consultas buscarão dados frescos."
        })
    } catch (error) {
        logger.error("Erro ao invalidar o cache de métricas:", error)
        return NextResponse.json({ error: "Failed to revalidate cache" }, { status: 500 })
    }
}
