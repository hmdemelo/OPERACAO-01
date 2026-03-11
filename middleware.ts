import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Caminhos que não exigem autenticação nem respeitam manutenção
const PUBLIC_PATHS = ["/signin", "/maintenance", "/api/auth", "/api/maintenance-status"]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Ignorar arquivos estáticos e internos
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public")
    ) {
        return NextResponse.next()
    }

    // 2. Permitir caminhos públicos sempre
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // 3. Capturar Token para validação de sessão e manutenção
    const token = await getToken({ req: request })
    const isMaintenance = process.env.MAINTENANCE_MODE === "true"

    // 4. Verificação de Modo de Manutenção (Apenas Admin entra)
    if (isMaintenance && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/maintenance", request.url))
    }

    // 5. Proteção de Rotas (Admin e Student)
    const isProtectedPath = pathname.startsWith("/admin") || pathname.startsWith("/student")

    if (isProtectedPath) {
        // Sessão expirada ou inexistente em rota protegida -> Signin
        if (!token) {
            const url = new URL("/signin", request.url)
            url.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(url)
        }

        // Bloqueio de Portais Cruzados (Segurança Adicional)
        if (pathname.startsWith("/admin") && token.role === "STUDENT") {
            return NextResponse.redirect(new URL("/student/dashboard", request.url))
        }

        if (pathname.startsWith("/student") && ["ADMIN", "MENTOR"].includes(token.role as string)) {
            // Permitir que admins vejam o dashboard de alunos se necessário, 
            // mas aqui garantimos que não fiquem perdidos.
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
