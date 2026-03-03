import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSubjectSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().max(2048).optional(),
    active: z.boolean().optional(),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = updateSubjectSchema.parse(json)
        const { id } = await params

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...body,
            },
        })

        return NextResponse.json(subject)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro Interno do Servidor", { status: 500 })
    }
}
