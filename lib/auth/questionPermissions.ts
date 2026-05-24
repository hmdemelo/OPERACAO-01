import { prisma } from "@/lib/db"
import { isMasterAdmin } from "@/lib/auth/superAdmin"

/**
 * Returns true if the given session user is allowed to approve/reject the question.
 *
 * Rules:
 * - Master admin: always allowed.
 * - If the question was uploaded by a STUDENT: only that student's responsible mentor
 *   (via MentorshipLink) can approve. If the student has no mentor (orphan),
 *   any ADMIN/MENTOR can approve.
 * - If the uploader is ADMIN or MENTOR: any ADMIN/MENTOR can approve.
 */
export async function canReviewQuestion(
    sessionUser: { id: string; role: string; email?: string | null },
    questionId: string
): Promise<{ allowed: boolean; reason?: string }> {
    if (sessionUser.role !== "ADMIN" && sessionUser.role !== "MENTOR") {
        return { allowed: false, reason: "Não autorizado" }
    }

    if (isMasterAdmin(sessionUser)) {
        return { allowed: true }
    }

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
            uploadedBy: {
                select: {
                    id: true,
                    role: true,
                    studentLink: { select: { mentorId: true } },
                },
            },
        },
    })

    if (!question) {
        return { allowed: false, reason: "Questão não encontrada" }
    }

    const uploader = question.uploadedBy

    // Uploader removido (LGPD): questão vira institucional, qualquer ADMIN/MENTOR pode aprovar.
    if (!uploader) {
        return { allowed: true }
    }

    if (uploader.role !== "STUDENT") {
        return { allowed: true }
    }

    const mentorId = uploader.studentLink?.mentorId
    if (!mentorId) {
        return { allowed: true }
    }

    if (sessionUser.id === mentorId) {
        return { allowed: true }
    }

    return {
        allowed: false,
        reason: "Apenas o mentor responsável pelo aluno pode revisar esta questão",
    }
}
