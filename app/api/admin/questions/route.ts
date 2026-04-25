import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { Prisma, QuestionStatus } from "@prisma/client"

const PAGE_SIZE = 20

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = (searchParams.get("status") as QuestionStatus | null) || "PENDING"
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(100, Number(searchParams.get("limit")) || PAGE_SIZE)
    const subjectId = searchParams.get("subjectId") || undefined
    const contentId = searchParams.get("contentId") || undefined
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined
    const source = searchParams.get("source") || undefined
    const q = searchParams.get("q") || undefined

    const where: Prisma.QuestionWhereInput = {
        status,
        ...(subjectId && { subjectId }),
        ...(contentId && { contentId }),
        ...(year && !isNaN(year) && { year }),
        ...(source && { source }),
        ...(q && {
            stem: { contains: q, mode: "insensitive" },
        }),
    }

    const [total, questions, subjects, contents, distinctYears, distinctSources] = await Promise.all([
        prisma.question.count({ where }),
        prisma.question.findMany({
            where,
            include: {
                subject: { select: { id: true, name: true } },
                content: { select: { id: true, name: true } },
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        studentLink: { select: { mentorId: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.subject.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.content.findMany({ select: { id: true, name: true, subjectId: true }, orderBy: { name: "asc" } }),
        prisma.question.findMany({
            where: { year: { not: null } },
            select: { year: true },
            distinct: ["year"],
            orderBy: { year: "desc" },
        }),
        prisma.question.findMany({
            where: { source: { not: null } },
            select: { source: true },
            distinct: ["source"],
            orderBy: { source: "asc" },
        }),
    ])

    return NextResponse.json({
        questions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
        filters: {
            subjects,
            contents,
            years: distinctYears.map((y) => y.year).filter((v): v is number => v !== null),
            sources: distinctSources.map((s) => s.source).filter((v): v is string => v !== null),
        },
    })
}
