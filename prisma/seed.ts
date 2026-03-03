import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL!,
        },
    },
})

async function main() {
    const adminPassword = await bcrypt.hash("123456", 10)
    const studentPassword = await bcrypt.hash("student123", 10)

    const admin = await prisma.user.upsert({
        where: { email: "admin@operacao01.com" },
        update: {
            passwordHash: adminPassword, // Ensure password is updated if it exists
        },
        create: {
            email: "admin@operacao01.com",
            name: "Administrador",
            passwordHash: adminPassword,
            role: "ADMIN",
        },
    })

    const student = await prisma.user.upsert({
        where: { email: "student@operacao01.com" },
        update: {},
        create: {
            email: "student@operacao01.com",
            name: "Student User",
            passwordHash: studentPassword,
            role: "STUDENT",
        },
    })

    // Create Subjects and Contents
    const subjectsData = [
        {
            name: "Mathematics",
            contents: ["Algebra", "Geometry", "Calculus"],
        },
        {
            name: "Physics",
            contents: ["Mechanics", "Thermodynamics", "Electromagnetism"],
        },
        {
            name: "Computer Science",
            contents: ["Algorithms", "Data Structures", "Databases"],
        },
    ]

    for (const subj of subjectsData) {
        let subject = await prisma.subject.findFirst({ where: { name: subj.name } })

        if (!subject) {
            subject = await prisma.subject.create({
                data: {
                    name: subj.name,
                    contents: {
                        create: subj.contents.map((name) => ({ name })),
                    },
                },
            })
        }
    }

    // Re-fetch created subjects to assign
    const allSubjects = await prisma.subject.findMany();

    // Assign 2 subjects to Student
    if (student && allSubjects.length >= 2) {
        await prisma.userSubject.createMany({
            data: [
                { userId: student.id, subjectId: allSubjects[0].id },
                { userId: student.id, subjectId: allSubjects[1].id },
            ],
            skipDuplicates: true,
        })
    }

    // Seed Plans
    const plansCount = await prisma.plan.count()
    if (plansCount === 0) {
        await prisma.plan.createMany({
            data: [
                {
                    title: "Mentoria 01",
                    description: "Acompanhamento e Software",
                    price: 189.0,
                    installments: "Pagamento Mensal",
                    features: ["Software Operação 01", "Ranking Nacional", "Planilha de Horas Líquidas", "Suporte Individual"],
                    whatsappMessage: "Olá! Tenho interesse no plano Operação Mentoria 01 (R$ 189,00).",
                    order: 1
                },
                {
                    title: "Combo Total",
                    description: "Mentoria + Aulas de Português",
                    price: 289.0,
                    oldPrice: 378.0,
                    installments: "Pagamento Mensal",
                    features: [
                        "Tudo do Plano Mentoria",
                        "Curso Português Completo",
                        "Curso de Redação Nota 1000",
                        "Mentor Weverson 24h",
                        "Acesso Vitalício aos Materiais"
                    ],
                    whatsappMessage: "Olá! Quero garantir o Combo Mentoria + Aulas (R$ 289,00).",
                    highlighted: true,
                    order: 2
                },
                {
                    title: "Português + Redação",
                    description: "Foco em Conteúdo Base",
                    price: 189.0,
                    installments: "Pagamento Mensal",
                    features: ["Videoaulas Teóricas", "Correção de Redação", "Material em PDF", "Exercícios Gabaritados"],
                    whatsappMessage: "Olá! Tenho interesse nas Aulas de Língua Portuguesa e Redação (R$ 189,00).",
                    order: 3
                }
            ]
        })
        console.log("Plans seeded")
    }

    console.log({ admin, student, subjectsCount: allSubjects.length, plans: plansCount === 0 ? 3 : plansCount })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
