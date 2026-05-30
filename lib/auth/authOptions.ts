import { logger } from "@/lib/logger";
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { getSetting } from "@/lib/settings"

// Segunda camada de rate limiting (Node.js runtime — persiste mais que a edge isolate).
// A primeira camada está no middleware.ts.
const AUTH_WINDOW_MS = 15 * 60 * 1000
const AUTH_MAX_ATTEMPTS = 10 // mais leniente que o middleware; edge já bloqueou os óbvios

const authAttempts = new Map<string, { count: number; resetAt: number }>()

function isAuthBlocked(key: string): boolean {
    const now = Date.now()
    const record = authAttempts.get(key)

    if (!record || now > record.resetAt) {
        authAttempts.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS })
        return false
    }

    if (record.count >= AUTH_MAX_ATTEMPTS) return true

    record.count++
    return false
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    // Rate limit por email — bloqueia ataques direcionados a uma conta
                    // mesmo que venham de IPs rotacionados.
                    const rateLimitKey = credentials.email.toLowerCase()
                    if (isAuthBlocked(rateLimitKey)) {
                        logger.warn("[AUTH] Rate limit excedido para:", rateLimitKey)
                        return null
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    })

                    if (!user) {
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.passwordHash
                    )

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    }
                } catch (error) {
                    logger.error("Authorize error:", error)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 1 * 60 * 60, // 1 hora de inatividade (janela deslizante)
        updateAge: 5 * 60, // Renova o cookie no máximo a cada 5 min, evitando re-assinar o JWT em toda requisição
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = user.role

                // Cria a UserSession já no login e guarda o ID no token, para que o
                // heartbeat atualize exatamente esta sessão (e não todas as abertas
                // do usuário). Cada login/navegador = uma linha; abas compartilham o
                // mesmo cookie e portanto o mesmo sessionId.
                try {
                    const enabled = await getSetting("tracking_enabled")
                    if (enabled !== "false") {
                        const now = new Date()
                        const us = await prisma.userSession.create({
                            data: { userId: user.id, loginAt: now, lastSeenAt: now },
                            select: { id: true },
                        })
                        token.sessionId = us.id
                    }
                } catch (e) {
                    logger.error("[TRACKING] criação de sessão falhou", e)
                }
            }

            // Se o admin atualizar o perfil, podemos forçar o update aqui futuramente
            if (trigger === "update" && session?.role) {
                token.role = session.role
            }

            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id
                session.user.role = token.role
                session.sessionId = token.sessionId
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    pages: {
        signIn: "/signin",
    },
    events: {
        // A criação da sessão acontece no callback jwt (precisa gravar o ID no token).
        async signOut({ token }) {
            try {
                const sessionId = token?.sessionId
                if (!sessionId) return
                const us = await prisma.userSession.findUnique({
                    where: { id: sessionId },
                    select: { logoutAt: true, loginAt: true },
                })
                if (!us || us.logoutAt) return // já fechada
                const now = new Date()
                const durationMin = Math.round((now.getTime() - us.loginAt.getTime()) / 60000)
                await prisma.userSession.update({
                    where: { id: sessionId },
                    data: { logoutAt: now, durationMin },
                })
            } catch (e) {
                logger.error("[TRACKING] signOut error", e)
            }
        },
    },
}
