
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    oldPrice: z.number().optional().nullable(),
    installments: z.string().optional().nullable(),
    features: z.array(z.string()).min(1).optional(),
    whatsappMessage: z.string().optional().nullable(),
    highlighted: z.boolean().optional(),
    active: z.boolean().optional(),
    order: z.number().int().optional()
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await params

    try {
        const json = await req.json()
        const body = updateSchema.parse(json)

        const plan = await prisma.plan.update({
            where: { id },
            data: body
        })

        return NextResponse.json(plan)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error(error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    const { id } = await params

    try {
        await prisma.plan.delete({
            where: { id }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logger.error(error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
