import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Caminhos que não exigem autenticação nem respeitam manutenção
const PUBLIC_PATHS = ["/signin", "/maintenance", "/api/auth", "/api/maintenance-status", "/primeirossocorros", "/combateaincendio"]

// Rate limiter para tentativas de login — persiste dentro da mesma Edge isolate.
// Não é compartilhado entre instâncias paralelas, mas é eficaz contra bots
// de IP único (o caso mais comum de credential stuffing).
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const LOGIN_MAX_ATTEMPTS = 5

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkLoginRateLimit(ip: string): { limited: boolean; retryAfter: number } {
    const now = Date.now()
    const record = loginAttempts.get(ip)

    if (!record || now > record.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
        return { limited: false, retryAfter: 0 }
    }

    if (record.count >= LOGIN_MAX_ATTEMPTS) {
        return { limited: true, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
    }

    record.count++
    return { limited: false, retryAfter: 0 }
}

// Detectar bots e requisições maliciosas de vulnerabilidade (ex: WordPress, PHP, ASP)
function isMaliciousRequest(pathname: string): boolean {
    const lowerPath = pathname.toLowerCase()

    // Bloquear extensões de arquivos executáveis/scripts comuns de outras tecnologias
    if (
        lowerPath.endsWith(".php") ||
        lowerPath.endsWith(".asp") ||
        lowerPath.endsWith(".aspx") ||
        lowerPath.endsWith(".jsp") ||
        lowerPath.endsWith(".jspx") ||
        lowerPath.endsWith(".cgi")
    ) {
        return true
    }

    // Bloquear caminhos comuns de WordPress ou outros painéis administrativos vulneráveis
    if (
        lowerPath.startsWith("/wp-") ||
        lowerPath.startsWith("/wordpress") ||
        lowerPath.startsWith("/wp/") ||
        lowerPath.startsWith("/cgi-bin") ||
        lowerPath.startsWith("/phpmyadmin") ||
        lowerPath.startsWith("/pma") ||
        lowerPath.startsWith("/adminer")
    ) {
        return true
    }

    return false
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 0. Bloquear requisições maliciosas/varreduras de vulnerabilidade imediatamente no Edge
    if (isMaliciousRequest(pathname)) {
        return new NextResponse("Bad Request", { status: 400 })
    }

    // 0.1 Rate limiting no endpoint de login — intercepta antes de liberar /api/auth
    if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            request.headers.get("x-real-ip") ??
            "unknown"

        const { limited, retryAfter } = checkLoginRateLimit(ip)

        if (limited) {
            return new NextResponse(
                JSON.stringify({ error: "Muitas tentativas de login. Tente novamente em alguns minutos." }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(retryAfter),
                    },
                }
            )
        }
    }

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

    // 3.1. Redirecionar usuários logados que acessam a Landing Page estática
    if (pathname === "/" && token) {
        if (token.role === "ADMIN" || token.role === "MENTOR") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        } else {
            return NextResponse.redirect(new URL("/student/dashboard", request.url))
        }
    }

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
