
import { prisma } from "../lib/db";

async function main() {
    console.log("🌱 Seeding 'Questões' content for all subjects...");

    const subjects = await prisma.subject.findMany({
        include: { contents: true }
    });

    console.log(`Found ${subjects.length} subjects.`);

    let createdCount = 0;

    for (const subject of subjects) {
        const hasQuestoes = subject.contents.some(c => c.name === "Questões");

        if (!hasQuestoes) {
            console.log(`Creating 'Questões' for subject: ${subject.name}`);
            await prisma.content.create({
                data: {
                    name: "Questões",
                    description: "Resolução de questões práticas",
                    subjectId: subject.id
                }
            });
            createdCount++;
        } else {
            console.log(`Skipping ${subject.name} (already has 'Questões')`);
        }
    }

    console.log(`✅ Seed complete. Created ${createdCount} new 'Questões' contents.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
