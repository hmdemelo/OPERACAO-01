import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

function readAppVersion(): string {
    try {
        const pkgPath = join(process.cwd(), "package.json")
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
        return pkg.version ?? "—"
    } catch {
        return "—"
    }
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const [totalUsers, activeUsers, inactiveUsers, totalLogs] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { active: true } }),
            prisma.user.count({ where: { active: false } }),
            prisma.studyLog.count(),
        ])

        return NextResponse.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
            },
            studyLogs: {
                total: totalLogs,
            },
            system: {
                version: readAppVersion(),
                nodeEnv: process.env.NODE_ENV,
                buildTime: process.env.VERCEL_GIT_COMMIT_SHA
                    ? `${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}`
                    : "Desenvolvimento local",
            },
        })
    } catch {
        return new NextResponse("Erro interno", { status: 500 })
    }
}

