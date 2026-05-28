import { PrismaClient } from "@prisma/client"

async function main() {
    const prisma = new PrismaClient()
    try {
        const v1Subjects = await prisma.subject.findMany({
            where: { active: true },
            orderBy: { name: "asc" },
            include: { contents: { orderBy: { name: "asc" } } },
        })

        console.log(`Encontradas ${v1Subjects.length} disciplinas V1 ativas.`)

        const existingV2 = await prisma.subjectV2.findMany({ select: { name: true } })
        const existingNames = new Set(existingV2.map((s) => s.name.trim().toLowerCase()))

        let createdSubjects = 0
        let skippedSubjects = 0
        let createdContents = 0

        let nextSubjectOrder = (await prisma.subjectV2.aggregate({ _max: { order: true } }))._max.order ?? -1

        for (const subj of v1Subjects) {
            if (existingNames.has(subj.name.trim().toLowerCase())) {
                skippedSubjects++
                console.log(`  • [skip] "${subj.name}" — já existe em V2`)
                continue
            }

            nextSubjectOrder++
            const v2 = await prisma.subjectV2.create({
                data: { name: subj.name, order: nextSubjectOrder, active: true },
            })
            createdSubjects++

            let nextContentOrder = -1
            for (const ctn of subj.contents) {
                nextContentOrder++
                await prisma.contentV2.create({
                    data: { subjectV2Id: v2.id, name: ctn.name, order: nextContentOrder },
                })
                createdContents++
            }

            console.log(`  ✓ "${subj.name}" criada com ${subj.contents.length} conteúdos`)
        }

        console.log("\nResumo:")
        console.log(`  Disciplinas criadas: ${createdSubjects}`)
        console.log(`  Disciplinas puladas (já existiam): ${skippedSubjects}`)
        console.log(`  Conteúdos criados: ${createdContents}`)
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
