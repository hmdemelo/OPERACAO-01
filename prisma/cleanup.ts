import { PrismaClient } from "@prisma/client"

/**
 * Cleanup Script — Selective Data Deletion
 * 
 * PRESERVES:
 *   - Admin user: hugomelo.ti@gmail.com
 *   - Subjects + Contents (matérias/conteúdos)
 *   - FeaturedStudent, MethodItem, Plan (homepage)
 *   - Concurso (catálogo)
 *   - SystemSettings (configurações)
 * 
 * DELETES (in FK-safe order):
 *   1. StudyLogHistory
 *   2. WeeklyPlanItem
 *   3. WeeklyPlan
 *   4. StudyLog
 *   5. UserSubject
 *   6. UserConcurso
 *   7. MentorshipLink
 *   8. User (where email ≠ hugomelo.ti@gmail.com)
 */

const ADMIN_EMAIL = "hugomelo.ti@gmail.com"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Verificando estado atual do banco...\n")

    // Pre-flight: verify admin exists
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
    if (!admin) {
        console.error(`❌ Admin ${ADMIN_EMAIL} não encontrado no banco! Abortando.`)
        process.exit(1)
    }
    console.log(`✅ Admin encontrado: ${admin.name} (${admin.email}) — SERÁ PRESERVADO\n`)

    // Count what will be deleted
    const counts = {
        studyLogHistory: await prisma.studyLogHistory.count(),
        weeklyPlanItem: await prisma.weeklyPlanItem.count(),
        weeklyPlan: await prisma.weeklyPlan.count(),
        studyLog: await prisma.studyLog.count(),
        userSubject: await prisma.userSubject.count(),
        userConcurso: await prisma.userConcurso.count(),
        mentorshipLink: await prisma.mentorshipLink.count(),
        usersToDelete: await prisma.user.count({ where: { email: { not: ADMIN_EMAIL } } }),
        totalUsers: await prisma.user.count(),
    }

    console.log("📊 O que será DELETADO:")
    console.log(`   StudyLogHistory:  ${counts.studyLogHistory} registros`)
    console.log(`   WeeklyPlanItem:   ${counts.weeklyPlanItem} registros`)
    console.log(`   WeeklyPlan:       ${counts.weeklyPlan} registros`)
    console.log(`   StudyLog:         ${counts.studyLog} registros`)
    console.log(`   UserSubject:      ${counts.userSubject} registros`)
    console.log(`   UserConcurso:     ${counts.userConcurso} registros`)
    console.log(`   MentorshipLink:   ${counts.mentorshipLink} registros`)
    console.log(`   Users:            ${counts.usersToDelete} de ${counts.totalUsers} (preservando admin)`)

    // Count what will be preserved
    const preserved = {
        subjects: await prisma.subject.count(),
        contents: await prisma.content.count(),
        featuredStudents: await prisma.featuredStudent.count(),
        methodItems: await prisma.methodItem.count(),
        plans: await prisma.plan.count(),
        concursos: await prisma.concurso.count(),
    }

    console.log("\n✅ O que será PRESERVADO:")
    console.log(`   Admin:            ${admin.name} (${admin.email})`)
    console.log(`   Subjects:         ${preserved.subjects}`)
    console.log(`   Contents:         ${preserved.contents}`)
    console.log(`   FeaturedStudents: ${preserved.featuredStudents}`)
    console.log(`   MethodItems:      ${preserved.methodItems}`)
    console.log(`   Plans:            ${preserved.plans}`)
    console.log(`   Concursos:        ${preserved.concursos}`)

    console.log("\n🚀 Executando limpeza em transação...\n")

    const result = await prisma.$transaction([
        prisma.studyLogHistory.deleteMany(),
        prisma.weeklyPlanItem.deleteMany(),
        prisma.weeklyPlan.deleteMany(),
        prisma.studyLog.deleteMany(),
        prisma.userSubject.deleteMany(),
        prisma.userConcurso.deleteMany(),
        prisma.mentorshipLink.deleteMany(),
        prisma.user.deleteMany({ where: { email: { not: ADMIN_EMAIL } } }),
    ])

    const labels = [
        "StudyLogHistory",
        "WeeklyPlanItem",
        "WeeklyPlan",
        "StudyLog",
        "UserSubject",
        "UserConcurso",
        "MentorshipLink",
        "User",
    ]

    console.log("✅ Limpeza concluída com sucesso!\n")
    result.forEach((r, i) => {
        console.log(`   ${labels[i]}: ${r.count} registros deletados`)
    })

    // Post-flight verification
    const remaining = await prisma.user.count()
    console.log(`\n🔒 Verificação final: ${remaining} usuário(s) restante(s) no banco`)

    if (remaining === 1) {
        const adminCheck = await prisma.user.findFirst()
        console.log(`   → ${adminCheck?.name} (${adminCheck?.email}) — ${adminCheck?.role}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
        console.log("\n✅ Conexão fechada. Script finalizado.")
    })
    .catch(async (e) => {
        console.error("\n❌ ERRO durante a limpeza:", e)
        await prisma.$disconnect()
        process.exit(1)
    })
