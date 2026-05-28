import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { canManageStudentGrade } from "@/lib/auth/gradeAccess"
import { getStudiedTopicV2Ids } from "@/lib/v2/cycles"

// GET /api/admin/students/[id]/cycles?catalog=1
// Quando ?catalog=1 retorna o catálogo V2 anotado com quais tópicos o aluno já
// estudou em ciclos anteriores. Sem o flag, retorna a lista de ciclos do aluno.
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    const { id: studentId } = await props.params
    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    const url = new URL(req.url)
    if (url.searchParams.get("catalog") === "1") {
        const [subjects, studied] = await Promise.all([
            prisma.subjectV2.findMany({
                where: { active: true },
                orderBy: [{ order: "asc" }, { name: "asc" }],
                select: {
                    id: true,
                    name: true,
                    contents: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            name: true,
                            topics: {
                                orderBy: { order: "asc" },
                                select: { id: true, title: true, defaultText: true },
                            },
                        },
                    },
                },
            }),
            getStudiedTopicV2Ids(studentId),
        ])
        const catalog = subjects.map(s => ({
            id: s.id,
            name: s.name,
            contents: s.contents.map(c => ({
                id: c.id,
                name: c.name,
                topics: c.topics.map(t => ({
                    id: t.id,
                    title: t.title,
                    defaultText: t.defaultText,
                    studied: studied.has(t.id),
                })),
            })),
        }))
        return NextResponse.json({ catalog })
    }

    const cycles = await prisma.studyGrid.findMany({
        where: { userId: studentId },
        orderBy: { cycleNumber: "asc" },
        select: {
            id: true,
            cycleNumber: true,
            cycleLabel: true,
            active: true,
            completedAt: true,
            createdAt: true,
        },
    })
    return NextResponse.json({ cycles })
}

const createSchema = z.object({
    cycleLabel: z.string().min(1).max(60),
    // Lista de topicV2 IDs selecionados pelo mentor. O endpoint reconstrói a
    // hierarquia subject→content→topic a partir desses IDs.
    topicV2Ids: z.array(z.string().min(1)).min(1),
})

// POST /api/admin/students/[id]/cycles
// Cria um novo StudyGrid (ciclo) com os tópicos selecionados. Falha se já
// existe um ciclo ativo — o mentor precisa encerrar o ciclo anterior antes.
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }
    const { id: studentId } = await props.params
    if (!(await canManageStudentGrade(session.user, studentId))) {
        return new NextResponse("Acesso negado", { status: 403 })
    }

    let body
    try {
        body = createSchema.parse(await req.json())
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(e.issues), { status: 400 })
        }
        throw e
    }

    const existingActive = await prisma.studyGrid.findFirst({
        where: { userId: studentId, active: true },
        select: { id: true, cycleNumber: true },
    })
    if (existingActive) {
        return new NextResponse(
            `Aluno tem o Ciclo ${existingActive.cycleNumber} ativo. Encerre antes de criar um novo.`,
            { status: 409 },
        )
    }

    const lastCycle = await prisma.studyGrid.findFirst({
        where: { userId: studentId },
        orderBy: { cycleNumber: "desc" },
        select: { cycleNumber: true },
    })
    const nextCycleNumber = (lastCycle?.cycleNumber ?? 0) + 1

    const topics = await prisma.topicV2.findMany({
        where: { id: { in: body.topicV2Ids } },
        select: {
            id: true,
            title: true,
            defaultText: true,
            order: true,
            contentV2: {
                select: {
                    id: true,
                    name: true,
                    order: true,
                    subjectV2: { select: { id: true, name: true, order: true } },
                },
            },
        },
    })
    if (topics.length === 0) {
        return new NextResponse("Nenhum tópico válido selecionado.", { status: 400 })
    }

    type SubjectGroup = {
        subjectId: string
        subjectOrder: number
        contents: Map<string, { contentId: string; contentOrder: number; topics: typeof topics }>
    }
    const subjects = new Map<string, SubjectGroup>()
    for (const t of topics) {
        const subjId = t.contentV2.subjectV2.id
        let subj = subjects.get(subjId)
        if (!subj) {
            subj = { subjectId: subjId, subjectOrder: t.contentV2.subjectV2.order, contents: new Map() }
            subjects.set(subjId, subj)
        }
        let cont = subj.contents.get(t.contentV2.id)
        if (!cont) {
            cont = { contentId: t.contentV2.id, contentOrder: t.contentV2.order, topics: [] }
            subj.contents.set(t.contentV2.id, cont)
        }
        cont.topics.push(t)
    }

    const orderedSubjects = [...subjects.values()].sort((a, b) => a.subjectOrder - b.subjectOrder)

    const grid = await prisma.studyGrid.create({
        data: {
            userId: studentId,
            cycleNumber: nextCycleNumber,
            cycleLabel: body.cycleLabel,
            active: true,
            blocks: {
                create: orderedSubjects.map((s, si) => ({
                    subjectV2Id: s.subjectId,
                    order: si,
                    visible: true,
                    contentBlocks: {
                        create: [...s.contents.values()]
                            .sort((a, b) => a.contentOrder - b.contentOrder)
                            .map((c, ci) => ({
                                contentV2Id: c.contentId,
                                order: ci,
                                visible: true,
                                topicBlocks: {
                                    create: c.topics
                                        .sort((a, b) => a.order - b.order)
                                        .map((t, ti) => ({
                                            topicV2Id: t.id,
                                            customText: t.defaultText,
                                            order: ti,
                                            visible: true,
                                        })),
                                },
                            })),
                    },
                })),
            },
        },
        select: { id: true, cycleNumber: true, cycleLabel: true },
    })

    return NextResponse.json(grid)
}
