import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = [
    {
        version: "v1.6",
        title: "Formatação Rica nas Questões",
        content: "✏️ **Markdown no Banco de Questões**: Enunciados, alternativas e comentários agora suportam formatação — **negrito**, *itálico*, ~~rasurado~~ e sublinhado. O conteúdo é renderizado automaticamente para todos os alunos.",
        category: "NEW"
    },
    {
        version: "v1.6",
        title: "Edição de Enunciado na Revisão",
        content: "🛠️ **Enunciado Editável pelos Mentores**: Na tela de revisão de questões, mentores e administradores agora podem editar o enunciado diretamente antes de aprovar, sem precisar rejeitar e reenviar.",
        category: "NEW"
    },
    {
        version: "v1.6",
        title: "Barra de Ferramentas de Formatação",
        content: "🎨 **Toolbar de Texto na Revisão**: Ao clicar no enunciado ou comentário de uma questão pendente, aparece uma barra lateral com atalhos de formatação — negrito, itálico, sublinhado e rasurado — aplicados diretamente no texto selecionado.",
        category: "NEW"
    },
    {
        version: "v1.6",
        title: "Importação com Formatação",
        content: "📄 **CSV com Markdown**: A importação em lote de questões agora aceita formatação markdown nas colunas de enunciado, alternativas e comentário. O template CSV foi atualizado com exemplos de uso.",
        category: "IMPROVEMENT"
    },
    {
        version: "v1.6",
        title: "IA Preserva Formatação Original",
        content: "🤖 **Extração Inteligente de Formatação**: Ao enviar uma imagem ou PDF com questões, a IA agora preserva negrito, itálico e demais marcações do documento original, convertendo automaticamente para markdown.",
        category: "IMPROVEMENT"
    },
];

async function main() {
    console.log("Iniciando a injeção do Changelog V1.6...");

    for (const update of updates) {
        await prisma.changelogEntry.create({
            data: {
                version: update.version,
                title: update.title,
                content: update.content,
                category: update.category,
                published: true,
                date: new Date()
            }
        });
        console.log(`✔ Atualização adicionada: ${update.title}`);
    }

    console.log("Todas as novidades da V1.6 foram injetadas com sucesso!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
