import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function GET() {
    try {
        const entries = await prisma.changelogEntry.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(entries)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch changelog" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { version, title, content, category } = body

        if (!version || !title || !content || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const entry = await prisma.changelogEntry.create({
            data: {
                version,
                title,
                content,
                category,
                published: true,
                date: new Date()
            }
        })

        // Invalida os caches das páginas que usam o changelog
        revalidatePath("/admin/changelog")
        revalidatePath("/student/dashboard") // Onde pode haver badges de novidade

        return NextResponse.json(entry)
    } catch (error) {
        console.error("Changelog create error:", error)
        return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
    }
}
