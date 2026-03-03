import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const mentorshipSchema = z.object({
    mentorId: z.string().nullable().optional()
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const { mentorId } = mentorshipSchema.parse(json)
        const { id: studentId } = await params

        if (!mentorId) {
            // Unlink existing mentor
            // @ts-ignore
            await prisma.mentorshipLink.deleteMany({
                where: { studentId }
            })
            return NextResponse.json({ success: true, message: "Mentoria removida" })
        }

        // Verify if mentor exists
        const mentorExists = await prisma.user.findFirst({
            where: {
                id: mentorId,
                role: { in: ["ADMIN", "MENTOR"] }
            }
        })

        if (!mentorExists) {
            return new NextResponse("Mentor inválido ou inexistente", { status: 400 })
        }

        // Link or update mentor
        // @ts-ignore
        const link = await prisma.mentorshipLink.upsert({
            where: { studentId },
            create: {
                studentId,
                mentorId
            },
            update: {
                mentorId
            }
        })

        return NextResponse.json(link)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[MENTORSHIP_POST]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
