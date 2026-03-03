import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const assignedSubjects = await prisma.userSubject.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            subject: {
                include: {
                    contents: true,
                },
            },
        },
    })

    const subjects = assignedSubjects.map((us) => us.subject)

    return NextResponse.json(subjects)
}
