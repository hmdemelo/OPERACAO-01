import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { testAIConnection } from "@/lib/ai/questionAnalyzer"
import { isMasterAdmin } from "@/lib/auth/superAdmin"

export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session || !isMasterAdmin(session.user)) {
        return NextResponse.json(
            { ok: false, error: "Apenas o admin master pode testar a IA" },
            { status: 403 }
        )
    }

    const result = await testAIConnection()
    return NextResponse.json(result)
}
