import { logger } from "@/lib/logger";
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().optional(),
    price: z.number().min(0),
    oldPrice: z.number().optional().nullable(),
    installments: z.string().optional().nullable(),
    features: z.array(z.string()).min(1, "Pelo menos um recurso (feature) deve ser adicionado"),
    whatsappMessage: z.string().optional().nullable(),
    highlighted: z.boolean().default(false),
    active: z.boolean().default(true),
    order: z.number().int().default(0)
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = createSchema.parse(json)

        const plan = await prisma.plan.create({
            data: body
        })

        return NextResponse.json(plan, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[PLAN_POST]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

export async function GET() {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })
        return NextResponse.json(plans)
    } catch (error) {
        logger.error("[PLANS_GET]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
