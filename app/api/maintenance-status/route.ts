import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Lightweight endpoint called by middleware to check maintenance mode.
// Protected by internal secret header — not exposed to the public.
export async function GET(req: Request) {
    const secret = req.headers.get("x-internal-request")
    if (secret !== process.env.NEXTAUTH_SECRET) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: "maintenance_mode" },
        })

        const maintenance = setting?.value === "true"
        return NextResponse.json({ maintenance })
    } catch {
        // If DB is unreachable, report maintenance as false (fail open)
        return NextResponse.json({ maintenance: false })
    }
}
