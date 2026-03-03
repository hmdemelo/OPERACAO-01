import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const assignSubjectsSchema = z.object({
    subjectIds: z.array(z.string()),
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()
        const { subjectIds } = assignSubjectsSchema.parse(json)
        const { id: userId } = await params

        // Use transaction to replace assignments
        await prisma.$transaction([
            prisma.userSubject.deleteMany({
                where: { userId },
            }),
            prisma.userSubject.createMany({
                data: subjectIds.map((subjectId) => ({
                    userId,
                    subjectId,
                })),
            }),
        ])

        return new NextResponse("Subjects assigned", { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
