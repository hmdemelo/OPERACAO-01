import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const subjects = await prisma.subjectV2.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
            contents: {
                orderBy: [{ order: "asc" }, { name: "asc" }],
                include: {
                    topics: { orderBy: [{ order: "asc" }, { title: "asc" }] },
                },
            },
        },
    })

    return NextResponse.json(subjects)
}
