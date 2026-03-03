
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return new NextResponse("Nenhum arquivo enviado", { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = file.name.replaceAll(" ", "_")
        const ext = path.extname(filename).toLowerCase() // e.g. .jpg

        // Validation
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"]
        if (!allowedExtensions.includes(ext)) {
            return new NextResponse("Tipo de arquivo inválido (apenas jpg, png, webp)", { status: 400 })
        }

        // Max size 3MB
        if (file.size > 3 * 1024 * 1024) {
            return new NextResponse("Arquivo muito grande (max 3MB)", { status: 400 })
        }

        // Safety: Generate clean filename
        const safeFilename = `${Date.now()}-${randomUUID()}${ext}`
        const uploadDir = path.join(process.cwd(), "public/uploads/featured")

        // Ensure dir exists
        await mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, safeFilename)

        await writeFile(filePath, buffer)

        return NextResponse.json({ url: `/uploads/featured/${safeFilename}` })

    } catch (error) {
        logger.error(error)
        return new NextResponse("Erro ao fazer upload", { status: 500 })
    }
}
