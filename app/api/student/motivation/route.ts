import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { buildV1Context, buildV2Context } from "@/lib/motivation/buildContext"
import {
    detectV1Scenario,
    detectV2Scenario,
    pickMessage,
    V1_MESSAGES,
    V2_MESSAGES,
} from "@/lib/motivation/messages"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ message: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { appVersion: true },
    })

    if (user?.appVersion === "v2") {
        const ctx = await buildV2Context(session.user.id)
        const scenario = detectV2Scenario(ctx)
        return NextResponse.json({ scenario, message: pickMessage(V2_MESSAGES[scenario]) })
    }

    const ctx = await buildV1Context(session.user.id)
    const scenario = detectV1Scenario(ctx)
    return NextResponse.json({ scenario, message: pickMessage(V1_MESSAGES[scenario]) })
}
