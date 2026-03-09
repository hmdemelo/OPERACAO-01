import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that are always accessible regardless of maintenance mode
const PUBLIC_PATHS = ["/signin", "/maintenance", "/api/auth", "/api/maintenance-status"]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip static assets and internal Next.js paths
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public")
    ) {
        return NextResponse.next()
    }

    // Always allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // Check maintenance mode via env var — no HTTP fetch, zero overhead
    const maintenance = process.env.MAINTENANCE_MODE === "true"

    if (maintenance) {
        try {
            const token = await getToken({ req: request })
            const isAdmin = token?.role === "ADMIN"

            if (!isAdmin) {
                return NextResponse.redirect(new URL("/maintenance", request.url))
            }
        } catch {
            // If token check fails, redirect to maintenance (fail safe)
            return NextResponse.redirect(new URL("/maintenance", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
