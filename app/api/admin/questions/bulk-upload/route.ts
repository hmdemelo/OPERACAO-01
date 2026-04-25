import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"
import { parseCsv, parseJson, matchSubjectsAndContents, MAX_ROWS } from "@/lib/questions/bulkParser"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const maxDuration = 60

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 })
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Arquivo maior que 5MB" }, { status: 400 })
        }

        const filename = file.name.toLowerCase()
        const isCsv = filename.endsWith(".csv") || file.type === "text/csv"
        const isJson = filename.endsWith(".json") || file.type === "application/json"

        if (!isCsv && !isJson) {
            return NextResponse.json({ error: "Apenas arquivos .csv ou .json são aceitos" }, { status: 400 })
        }

        const text = await file.text()
        const result = isCsv ? parseCsv(text) : parseJson(text)

        if (result.valid.length === 0) {
            return NextResponse.json({
                imported: 0,
                failed: result.errors.length,
                errors: result.errors,
            }, { status: 400 })
        }

        const [subjects, contents] = await Promise.all([
            prisma.subject.findMany({
                where: { active: true },
                select: { id: true, name: true },
            }),
            prisma.content.findMany({
                select: { id: true, name: true, subjectId: true },
            }),
        ])

        const matched = matchSubjectsAndContents(result.valid, subjects, contents)

        const created = await prisma.question.createMany({
            data: matched.map((m) => ({
                status: "PENDING" as const,
                subjectId: m.subjectId,
                contentId: m.contentId,
                stem: m.row.stem,
                alternatives: m.row.alternatives,
                correctAnswer: m.row.correctAnswer,
                commentary: m.row.commentary,
                source: m.row.source,
                year: m.row.year,
                uploadedById: session.user.id,
            })),
        })

        const unmatchedSubjects = matched.filter((m) => m.row.subjectName && !m.subjectId).length
        const unmatchedContents = matched.filter((m) => m.row.contentName && !m.contentId).length

        return NextResponse.json({
            imported: created.count,
            failed: result.errors.length,
            errors: result.errors,
            warnings: {
                unmatchedSubjects,
                unmatchedContents,
            },
            limits: { maxRows: MAX_ROWS },
        })
    } catch (error) {
        logger.error("Bulk question upload failed:", error)
        const message = error instanceof Error ? error.message : "Erro ao processar arquivo"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
