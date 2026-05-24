import { prisma } from "@/lib/db"
import { isSuperAdmin } from "@/lib/auth/superAdmin"

type SessionUser = { id: string; role: string; email?: string | null }

/**
 * Returns true if the user may manage the given student's study grid.
 * ADMIN → always. MENTOR → only if actively linked to the student (super admins bypass).
 */
export async function canManageStudentGrade(user: SessionUser, studentId: string): Promise<boolean> {
    if (user.role === "ADMIN") return true
    if (user.role === "MENTOR") {
        if (isSuperAdmin(user.email)) return true
        const link = await prisma.mentorshipLink.findFirst({
            where: { mentorId: user.id, studentId, active: true },
        })
        return Boolean(link)
    }
    return false
}
