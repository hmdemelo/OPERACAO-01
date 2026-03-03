
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const METHOD_ITEMS = [
    {
        step: "01",
        title: "Diagnóstico Tático",
        description: "Identificamos seus pontos fracos através de um simulado nivelador para traçar sua rota de combate.",
        icon: "Compass",
        order: 0
    },
    {
        step: "02",
        title: "Plano de Operações",
        description: "Cronograma personalizado focado em horas líquidas e ciclo de matérias otimizado.",
        icon: "PenTool",
        order: 1
    },
    {
        step: "03",
        title: "Execução & Registro",
        description: "Você registra cada minuto e questão no nosso terminal. Dados que geram evolução real.",
        icon: "Target",
        order: 2
    },
    {
        step: "04",
        title: "Revisão e Vitória",
        description: "Ajustes semanais com o mentor Weverson baseados no seu ranking e métricas de acerto.",
        icon: "Trophy",
        order: 3
    }
];

async function seedMethodItems() {
    console.log('Seeding Method Items...')
    // First, clear existing to avoid duplicates if re-run (optional, but good for idempotency if unique constraints aren't strict on these fields)
    // Actually, let's just create if not exists or upsert. Since we don't have a unique key other than ID, let's delete all and recreate for a clean slate, 
    // or just creating new ones. The user asked to "migrate", implying moving existing hardcoded data to DB.

    // Check if any exist
    const count = await prisma.methodItem.count();
    if (count > 0) {
        console.log(`Found ${count} method items already. Skipping seed to prevent duplicates.`);
        return;
    }

    for (const item of METHOD_ITEMS) {
        await prisma.methodItem.create({
            data: {
                step: item.step,
                title: item.title,
                description: item.description,
                icon: item.icon,
                order: item.order,
                active: true
            }
        })
    }
    console.log('Method Items seeded successfully.')
}

seedMethodItems()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
