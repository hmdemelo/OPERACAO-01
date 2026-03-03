import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { WeeklyPlanEditor } from "@/components/admin/WeeklyPlanEditor"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminStudentPlanPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const student = await prisma.user.findUnique({
        where: { id },
        select: {
            name: true,
            userConcursos: {
                include: {
                    concurso: {
                        select: { name: true }
                    }
                }
            }
        }
    })

    // Build subject filter: for MENTOR, intersect with their own subjects
    const userRole = session.user.role as string
    const subjectWhere: any = {
        active: true,
        users: {
            some: { userId: id }
        }
    }

    if (userRole === "MENTOR") {
        // Get mentor's own subject IDs
        const mentorSubjects = await prisma.userSubject.findMany({
            where: { userId: session.user.id },
            select: { subjectId: true }
        })
        const mentorSubjectIds = mentorSubjects.map(ms => ms.subjectId)

        // Intersect: student's subjects that the mentor is also qualified for
        subjectWhere.id = { in: mentorSubjectIds }
    }

    const subjects = await prisma.subject.findMany({
        where: subjectWhere,
        select: {
            id: true,
            name: true,
            contents: {
                select: { id: true, name: true }
            }
        }
    })

    // Format Name: First Name + First Surname
    const nameParts = student?.name?.split(" ") || []
    const formattedName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1]}`
        : nameParts[0] || "Aluno"

    const userExams = student?.userConcursos?.map(uc => uc.concurso.name) || []

    return (
        <div className="container mx-auto p-6 space-y-4">
            <div className="flex items-center gap-4">
                <a
                    href="/admin/schedules"
                    className="text-sm font-medium hover:underline text-muted-foreground flex items-center gap-1"
                >
                    ← Voltar para a Visão de Cronogramas
                </a>
            </div>
            <WeeklyPlanEditor
                userId={id}
                subjects={subjects}
                studentName={formattedName}
                userExams={userExams}
            />
        </div>
    )
}

