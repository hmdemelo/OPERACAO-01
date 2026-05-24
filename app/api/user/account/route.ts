import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { z } from "zod"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

const deleteSchema = z.object({
    password: z.string().min(1, "Senha obrigatória"),
})

// Autodeleção LGPD (art. 18, VI) — apenas STUDENT pode usar este fluxo.
// ADMIN e MENTOR precisam de processo manual (transferência de alunos, sucessão de papel).
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return new NextResponse("Não autenticado", { status: 401 })
    }

    try {
        const body = deleteSchema.parse(await req.json())

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true, passwordHash: true },
        })

        if (!user) {
            return new NextResponse("Usuário não encontrado", { status: 404 })
        }

        if (user.role !== "STUDENT") {
            return new NextResponse(
                "Apenas contas de aluno podem ser excluídas por autosserviço. Contate o suporte.",
                { status: 400 },
            )
        }

        const passwordOk = await bcrypt.compare(body.password, user.passwordHash)
        if (!passwordOk) {
            return new NextResponse("Senha incorreta", { status: 401 })
        }

        await prisma.user.delete({ where: { id: user.id } })

        logger.info("[USER_SELF_DELETE]", {
            userId: user.id,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({ deleted: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        logger.error("[USER_SELF_DELETE]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
