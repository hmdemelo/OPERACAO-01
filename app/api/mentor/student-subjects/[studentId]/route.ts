import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET: Returns all mentor's subjects + which ones are linked to this student
export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const { studentId } = await params
        const userId = session.user.id
        const userRole = session.user.role as string

        // Get the mentor's subjects (for MENTOR) or all subjects (for ADMIN)
        const mentorSubjectFilter = userRole === "MENTOR"
            ? { users: { some: { userId } } }
            : {}

        const allSubjects = await prisma.subject.findMany({
            where: { active: true, ...mentorSubjectFilter },
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        })

        // Get which subjects are currently linked to the student
        const studentSubjects = await prisma.userSubject.findMany({
            where: { userId: studentId },
            select: { subjectId: true }
        })
        const linkedIds = new Set(studentSubjects.map(s => s.subjectId))

        const result = allSubjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            linked: linkedIds.has(subject.id)
        }))

        return NextResponse.json(result)
    } catch (error) {
        logger.error("[STUDENT_SUBJECTS_GET]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}

// PATCH: Update which subjects are linked to this student
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const { studentId } = await params
        const { subjectIds } = await req.json() as { subjectIds: string[] }

        if (!Array.isArray(subjectIds)) {
            return new NextResponse("subjectIds deve ser um array", { status: 400 })
        }

        const userId = session.user.id
        const userRole = session.user.role as string

        // For MENTOR: only allow linking subjects that the mentor has
        if (userRole === "MENTOR") {
            const mentorSubjects = await prisma.userSubject.findMany({
                where: { userId },
                select: { subjectId: true }
            })
            const allowedIds = new Set(mentorSubjects.map(s => s.subjectId))

            // Get current student subjects NOT managed by this mentor (keep them)
            const currentStudentSubjects = await prisma.userSubject.findMany({
                where: { userId: studentId },
                select: { subjectId: true }
            })

            // Separate into: mentor-managed and other subjects
            const otherSubjectIds = currentStudentSubjects
                .filter(s => !allowedIds.has(s.subjectId))
                .map(s => s.subjectId)

            // Validate that submitted IDs are all within the mentor's scope
            const validIds = subjectIds.filter(id => allowedIds.has(id))

            // Final list: other (untouched) + newly selected from mentor's scope
            const finalIds = [...otherSubjectIds, ...validIds]

            // Delete all and recreate
            await prisma.userSubject.deleteMany({ where: { userId: studentId } })
            if (finalIds.length > 0) {
                await prisma.userSubject.createMany({
                    data: finalIds.map(subjectId => ({ userId: studentId, subjectId }))
                })
            }
        } else {
            // ADMIN: full control, replace all
            await prisma.userSubject.deleteMany({ where: { userId: studentId } })
            if (subjectIds.length > 0) {
                await prisma.userSubject.createMany({
                    data: subjectIds.map(subjectId => ({ userId: studentId, subjectId }))
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        logger.error("[STUDENT_SUBJECTS_PATCH]", error)
        return new NextResponse("Erro Interno", { status: 500 })
    }
}
