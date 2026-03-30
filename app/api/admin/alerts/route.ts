import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { getStudentsAtRisk } from "@/lib/services/riskAlertService"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user
        if (!user || (user.role !== "MENTOR" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Operation restricted to ACTIVE mentors and admins" }, { status: 403 })
        }

        const alerts = await getStudentsAtRisk(user.role === "MENTOR" ? user.id : undefined)
        return NextResponse.json(alerts)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to fetch risk alerts" }, { status: 500 })
    }
}
