import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { extractQuestion } from "@/lib/ai/questionAnalyzer"
import { logger } from "@/lib/logger"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]

export const maxDuration = 60 // Vercel serverless function timeout (seconds)

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const source = (formData.get("source") as string | null) || null

        if (!file) {
            return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 })
        }
        if (!ALLOWED_MIMES.includes(file.type)) {
            return NextResponse.json({ error: `Tipo de arquivo não suportado: ${file.type}` }, { status: 400 })
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Arquivo maior que 10MB" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        const [subjects, contents] = await Promise.all([
            prisma.subject.findMany({
                where: { active: true },
                select: { id: true, name: true },
                orderBy: { name: "asc" },
            }),
            prisma.content.findMany({
                select: { id: true, name: true, subjectId: true },
                orderBy: { name: "asc" },
            }),
        ])

        const extracted = await extractQuestion(buffer, file.type, subjects, contents)

        const created = await prisma.question.create({
            data: {
                status: "PENDING",
                subjectId: extracted.subjectId,
                contentId: extracted.contentId,
                stem: extracted.stem,
                alternatives: extracted.alternatives,
                source: source || extracted.source,
                year: extracted.year,
                uploadedById: session.user.id,
            },
            select: { id: true, externalCode: true },
        })

        return NextResponse.json(created)
    } catch (error) {
        logger.error("Question upload failed:", error)
        const message = error instanceof Error ? error.message : "Erro ao processar questão"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
