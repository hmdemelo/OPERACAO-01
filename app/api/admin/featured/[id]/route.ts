
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { unlink } from "fs/promises"
import path from "path"

const updateSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    role: z.string().min(1, "Função é obrigatória"),
    quote: z.string().min(1, "Depoimento é obrigatório"),
    imageUrl: z.string().min(1, "Imagem é obrigatória"),
    active: z.boolean(),
    order: z.number().int().optional()
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const body = updateSchema.parse(json)

        const updated = await prisma.featuredStudent.update({
            where: { id },
            data: body
        })

        return NextResponse.json(updated)
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
    const { id } = await params

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        // 1. Fetch student to get imageUrl
        const student = await prisma.featuredStudent.findUnique({
            where: { id }
        })

        if (student?.imageUrl) {
            // 2. Extract filename and try to delete physical file
            // URL example: /uploads/featured/123-pic.jpg
            const urlParts = student.imageUrl.split("/")
            const filename = urlParts[urlParts.length - 1]

            // Safety check: ensure filename doesn't traverse
            if (!filename.includes("..") && !filename.includes("/")) {
                const filePath = path.join(process.cwd(), "public/uploads/featured", filename)

                try {
                    await unlink(filePath)
                } catch (unlinkError) {
                    console.warn(`Failed to delete file: ${filePath}`, unlinkError)
                    // Continue deletion even if unlink fails
                }
            }
        }

        // 3. Delete DB record
        await prisma.featuredStudent.delete({
            where: { id }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logger.error(error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
