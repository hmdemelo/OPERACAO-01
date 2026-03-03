import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            !["ADMIN", "MENTOR"].includes(req.nextauth.token?.role as string)
        ) {
            return NextResponse.redirect(new URL("/student/dashboard", req.url))
        }

        if (
            req.nextUrl.pathname.startsWith("/student") &&
            req.nextauth.token?.role !== "STUDENT"
        ) {
            if (["ADMIN", "MENTOR"].includes(req.nextauth.token?.role as string)) {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url))
            }
            return NextResponse.rewrite(
                new URL("/signin?message=Not Authorized", req.url)
            )
        }

    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/signin",
        },
    }
)

export const config = { matcher: ["/student/:path*", "/admin/:path*"] }
