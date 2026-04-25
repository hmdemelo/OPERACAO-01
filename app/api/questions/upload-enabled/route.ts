import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { getSetting } from "@/lib/settings"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ enabled: false }, { status: 401 })

    const val = await getSetting("student_upload_enabled")
    return NextResponse.json({ enabled: val === "true" })
}
