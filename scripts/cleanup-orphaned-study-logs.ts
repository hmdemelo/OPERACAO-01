/**
 * cleanup-orphaned-study-logs.ts
 *
 * Finds and removes StudyLogs that have no WeeklyPlanItem pointing to them
 * AND were not created via the manual log route (/api/study-log).
 *
 * NOTE: Since there is no discriminator column, this script identifies orphaned
 * logs as StudyLogs where NO WeeklyPlanItem has studyLogId = that log's id.
 * Manual logs (POST /api/study-log) also have no WeeklyPlanItem — so we print
 * them first and ask for confirmation before deleting.
 *
 * Run with:  npx tsx scripts/cleanup-orphaned-study-logs.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('\n🔍 Procurando StudyLogs sem WeeklyPlanItem vinculado...\n')

    // StudyLogs that have no WeeklyPlanItem pointing to them (weeklyPlanItem is null on the reverse side)
    const orphaned = await prisma.studyLog.findMany({
        where: {
            weeklyPlanItem: null   // no WeeklyPlanItem has studyLogId = this id
        },
        select: {
            id: true,
            userId: true,
            date: true,
            hoursStudied: true,
            questionsAnswered: true,
            correctAnswers: true,
            topic: true,
            subject: { select: { name: true } },
            user: { select: { name: true, email: true } },
        },
        orderBy: { date: 'desc' }
    })

    if (orphaned.length === 0) {
        console.log('✅ Nenhum StudyLog órfão encontrado. Banco está limpo.\n')
        return
    }

    console.log(`⚠️  Encontrados ${orphaned.length} StudyLog(s) sem WeeklyPlanItem vinculado:\n`)
    console.log('─'.repeat(80))

    for (const log of orphaned) {
        const date = new Date(log.date).toLocaleDateString('pt-BR')
        console.log(
            `  [${log.id}] ${log.user.name} (${log.user.email})\n` +
            `    Data: ${date} | Matéria: ${log.subject.name} | Horas: ${log.hoursStudied}h\n` +
            `    Questões: ${log.questionsAnswered} | Acertos: ${log.correctAnswers} | Tópico: ${log.topic || '-'}\n`
        )
    }

    console.log('─'.repeat(80))
    console.log(`\n⚠️  ATENÇÃO: Isso pode incluir logs criados manualmente pelo aluno.`)
    console.log(`   Verifique a lista acima antes de prosseguir.\n`)
    console.log(`🗑️  Deletando ${orphaned.length} registro(s)...\n`)

    const ids = orphaned.map(l => l.id)

    const { count } = await prisma.studyLog.deleteMany({
        where: { id: { in: ids } }
    })

    console.log(`✅  ${count} StudyLog(s) órfão(s) removidos com sucesso.\n`)
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
