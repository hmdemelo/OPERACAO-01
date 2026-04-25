/**
 * Super Admin Configuration
 *
 * Users listed here bypass mentor-student filtering and see ALL students,
 * regardless of MentorshipLink associations.
 */
const SUPER_ADMIN_EMAILS: readonly string[] = [
    'hugomelo.ti@gmail.com',
]

/**
 * Returns true if the given email belongs to a super admin.
 * Super admins with role MENTOR see all students instead of only their own.
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
    if (!email) return false
    return SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Given a session user, returns the mentorId to use in DB queries.
 * - ADMIN → always undefined (sees all)
 * - MENTOR + super admin → undefined (sees all)
 * - MENTOR → their own userId (sees only own students)
 */
export function getMentorIdFilter(user: {
    id: string
    role: string
    email?: string | null
}): string | undefined {
    if (user.role !== 'MENTOR') return undefined
    if (isSuperAdmin(user.email)) return undefined
    return user.id
}

/**
 * Master Admin: ADMIN role + email in the super admin whitelist.
 * Only the master admin can edit other ADMINs, change roles, or reset users.
 */
export function isMasterAdmin(user: {
    role: string
    email?: string | null
}): boolean {
    return user.role === 'ADMIN' && isSuperAdmin(user.email)
}
