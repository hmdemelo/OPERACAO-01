import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that are always accessible regardless of maintenance mode
const PUBLIC_PATHS = ["/signin", "/maintenance", "/api/auth"]
const ADMIN_PATHS = ["/admin"]

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

    // Check maintenance mode via DB — we cannot import lib/settings directly
    // in Edge middleware, so we call the internal API instead
    try {
        const settingsUrl = new URL("/api/admin/settings", request.url)
        // We use a server-side fetch with the cookie forwarded so the session check passes
        // But for maintenance mode we use a lightweight cookie-less approach:
        // maintenance mode is stored as an env-like flag checked via a dedicated lite endpoint
        const maintenanceUrl = new URL("/api/maintenance-status", request.url)
        const maintenanceRes = await fetch(maintenanceUrl, {
            headers: { "x-internal-request": process.env.NEXTAUTH_SECRET || "internal" },
        })

        if (maintenanceRes.ok) {
            const { maintenance } = await maintenanceRes.json()

            if (maintenance) {
                const token = await getToken({ req: request })
                const isAdmin = token?.role === "ADMIN"

                if (!isAdmin) {
                    return NextResponse.redirect(new URL("/maintenance", request.url))
                }
            }
        }
    } catch {
        // If the maintenance check fails, allow request to proceed (fail open)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
