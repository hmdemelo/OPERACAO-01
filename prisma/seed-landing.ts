
import { prisma } from "../lib/db"

const PAST_RESULTS = [
    { name: "Ricardo Oliveira", role: "Aprovado PRF", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop", quote: "A mentoria mudou meu ritmo de jogo." },
    { name: "Fernanda Santos", role: "Aprovada PF - Agente", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop", quote: "Foco total no que realmente cai." },
    { name: "Lucas Mendes", role: "1º Lugar PM-SP", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop", quote: "Estratégia é 90% da aprovação." },
    { name: "Camila Rocha", role: "Aprovada PC-DF", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop", quote: "O ranking me motivou todos os dias." },
    { name: "Gabriel Silva", role: "Aprovado Receita Federal", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop", quote: "Disciplina tática impecável." },
    { name: "Beatriz Lima", role: "Aprovada PC-RJ", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&h=150&auto=format&fit=crop", quote: "Materiais direto ao ponto." },
];

async function seedFeaturedStudents() {
    console.log('Seeding Featured Students...')
    for (const [index, student] of PAST_RESULTS.entries()) {
        await prisma.featuredStudent.create({
            data: {
                name: student.name,
                role: student.role,
                imageUrl: student.image,
                quote: student.quote,
                order: index,
                active: true
            }
        })
    }
}

seedFeaturedStudents()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
